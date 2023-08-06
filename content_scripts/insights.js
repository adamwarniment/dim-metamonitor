window.onload = function(event){
    let apiResult = JSON.parse(document.querySelector('body').firstChild.innerText);
    console.log(apiResult);

    let url = location.href;

    let modeName = url.match(/(?<=&modeName=)(.*)(?=&weaponName)/)[0];
    let weaponName = url.match(/(?<=&weaponName=)(.*)/)[0];
    apiResult.mode = modeName;
    apiResult.weapon = weaponName;

    // send message to background
    chrome.runtime.sendMessage({type: "insights", body: apiResult});
}