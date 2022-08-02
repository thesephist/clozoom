const input = document.getElementById('closeAutomatically');
const timeout = document.getElementById('timeout')

// set checkbox value
chrome.storage.local.get({'enabled': true}, result => {
    input.checked = result.enabled;
});

chrome.storage.local.get({'secondsToClose': 10}, result => {
    timeout.value = result.secondsToClose;
});

// trigger toggle
input.addEventListener('change', evt => {
    const enabled = evt.target.checked;
    chrome.storage.local.set({'enabled': enabled});
});

timeout.addEventListener('input', tmt => {
    const secondsToClose = parseInt(tmt.target.value);
    if (secondsToClose != 0) {
        chrome.storage.local.set({'secondsToClose': secondsToClose});
    }
});

