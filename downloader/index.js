// listener
chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    if(request.type == 'downloadCsv') {

        console.log(request.csvData);

        const blob = new Blob([request.csvData], { type: 'text/csv' });

        // Create a temporary anchor element to trigger the download
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${request.filename}.csv`;

        // Trigger the download
        downloadLink.click();  
    }
})

// function to send to background
async function sendApiCallMessage(){
    //window.alert('clicked');
    const response = await chrome.runtime.sendMessage({type: "loopWeapons"});
    // do something with response here, not outside the function
    console.log(response);
}

sendApiCallMessage();