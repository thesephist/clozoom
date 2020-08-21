// background page, sole task is to send command to
// close a given tab.

function isClosableZoomInviteURL(url) {
    // https://us02web.zoom.us/j/6830992169#success
    const isZoomInviteURL = url.match(/https:\/\/\S+\.zoom.us\/j\/.+/);
    const isSuccess = url.endsWith('#success');

    return isZoomInviteURL && isSuccess;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const url = tab.url;
    if (!isClosableZoomInviteURL(url)) return;

    const closeWhenUnfocus = window => {
        if (window !== chrome.windows.WINDOW_ID_NONE) return;

        chrome.windows.onFocusChanged.removeListener(closeWhenUnfocus);

        setTimeout(() => {
            chrome.tabs.get(tabId, () => {
                if (!chrome.runtime.lastError) {
                    chrome.tabs.remove(tabId);
                }
            });
        }, 1000);
    }

    chrome.windows.onFocusChanged.addListener(closeWhenUnfocus);
});
