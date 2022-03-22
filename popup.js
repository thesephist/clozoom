const input = document.querySelector('input');
const timeout = document.getElementById('timeout')

// set checkbox value
chrome.storage.local.get({'enabled': true}, result => {
    input.checked = result.enabled;
});

chrome.storage.local.get({'secondsToClose': 5}, result => {
    timeout.value = result.secondsToClose;
});

// trigger toggle
input.addEventListener('change', evt => {
    const enabled = evt.target.checked;
    chrome.storage.local.set({'enabled': enabled});
});

timeout.addEventListener('change', tmt => {
    const secondsToClose = tmt.target.value;
    chrome.storage.local.set({'secondsToClose': secondsToClose});
});

