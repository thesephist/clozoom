const input = document.querySelector('input');

// set checkbox value
chrome.storage.local.get({enabled: true}, result => {
    input.checked = result.enabled;
});

// trigger toggle
input.addEventListener('change', evt => {
    const enabled = evt.target.checked;
    chrome.storage.local.set({enabled});
});

