import {callApi} from './modules/sw-api.js'

// GLOBAL VARIABLES //
let _insights = [];
const _modes = {
    'PVE': '7',
    'PVP': '69'
}
const _weapons = {
    'Auto_Rifle': '5',
    'Hand_Cannon': '6',
    'Pulse_Rifle': '7',
    'Scout_Rifle': '8',
    'Fusion_Rifle': '9',
    'Sniper_Rifle': '10',
    'Shotgun': '11',
    'Machine_Gun': '12',
    'Rocket_Launcher': '13',
    'Sidearm': '14',
    'Sword': '54',
    'Grenade_Launcher': '153950757',
    'Linear_Fusion_Rifle': '1504945536',
    'Trace_Rifle': '2489664120',
    'Bow': '3317538576',
    'Submachine_Gun': '3954685534',
    'Glaive': '3871742104'
}

let _urls = [];
/*
Object.keys(_modes).forEach(modeName => {
    let modeId = _modes[modeName];
    // loop weaponId keys
    Object.keys(_weapons).forEach(weaponName => {
        let weaponId = _weapons[weaponName];
        _urls.push(`https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&modes=${modeId}&types=${weaponId}&modeName=${modeName}&weaponName=${weaponName}`)
    })
})
*/

Object.keys(_weapons).forEach(weaponName => {
    let weaponId = _weapons[weaponName];
    _urls.push(`https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&types=${weaponId}&modeName=GLOBAL&weaponName=${weaponName}`)
})



chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        if(request.type == 'loopWeapons') {
            console.log('loopWeapons');
            console.log('down here');
                // generate URLS
                console.log(_urls);
                let urls = _urls;
                let i=0;
                do{
                    // runn async 
                    console.log(`loop ${i} for urls}`);
                    await getWeaponUsageApi(urls[i]);
                    i++;
                }while( i<urls.length );
                console.log(_insights);
                downloadCsv(_insights);
        }

        if(request.type == 'insights'){
            console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
            chrome.tabs.remove(sender.tab.id);
            _insights = [..._insights, request.body];
        }
    }
);

// scrape function
async function getWeaponUsageApi(apiUrl){
    console.log('sub function');
    return new Promise((usageResolve, reject) => {
        chrome.tabs.create({ url: apiUrl, selected: false}, (tab) => {
            // execute the get truancy values script at the document end
            chrome.scripting.executeScript({
                target : {tabId : tab.id},
                files : [ './content_scripts/insights.js' ]
            })
                .then(async emptyPromise => {

                    // Create a promise that resolves when chrome.runtime.onMessage fires
                    const message = new Promise(resolve => {
                        const listener = request => {
                            chrome.runtime.onMessage.removeListener(listener);
                            resolve(request);
                        };
                        chrome.runtime.onMessage.addListener(listener);
                    });
            
                    const result = await message;
                    //console.log(result); // Logs true
                    usageResolve(result);
                });
        });
    });
}

function downloadCsv(insights){
    const headers = 'gameMode,weaponType,hash,weaponName,rank\n'
    let weaponRows = '';
    // loop the dataClusters
    insights.forEach(weaponUsage => {
        let rank = 0;
        let weaponType = weaponUsage.weapon;
        let gameMode = weaponUsage.mode;
        // loop the data
        weaponUsage.data.forEach(weapon => {
            rank++;
            weaponRows = weaponRows + `${weaponType},${gameMode},${weapon.hash},${weapon.name.replaceAll(',',';')},${rank}\n`;
        })
    })
    
    const csvData = headers + weaponRows;
    
    chrome.runtime.sendMessage({type: "downloadCsv", csvData: csvData, filename: 'allweapons'});
}