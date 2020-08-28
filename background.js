// background page, sole task is to send command to
// close a given tab.

// Map<TabID, true>
const CLOSED_ZOOM_TABS = {};

function isClosableZoomInviteURL(url) {
    // https://us02web.zoom.us/j/6830992169#success
    // https://zoom.us/j/6830992169#success
    const isZoomInviteURL = url.match(/https:\/\/(\S+\.)?zoom.us\/j\/.+/);
    const isSuccess = url.endsWith('#success');

    return isZoomInviteURL && isSuccess;
}

function ifEnabled(f) {
    chrome.storage.local.get({enabled: true}, result => {
        if (result.enabled) f();
    });
}

chrome.runtime.onMessage.addListener(msg => {
    const tabId = msg.tabId;

    // this technical leaks some tabIds, but it's not serious -- Chrome
    // instances accumulate no more tha maybe 10,000s of zoom tabIds and V8
    // can handle those objects just fine.
    delete CLOSED_ZOOM_TABS[tabId];

    ifEnabled(() => {
        chrome.tabs.get(tabId, () => {
            if (!chrome.runtime.lastError) {
                chrome.tabs.remove(tabId);
            }
        });
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const url = tab.url;
    if (!isClosableZoomInviteURL(url)) return;


    ifEnabled(() => {
        if (CLOSED_ZOOM_TABS[tabId]) return;
        CLOSED_ZOOM_TABS[tabId] = true;

        chrome.tabs.executeScript(tabId, {
            code: `(function(){
            const checkIfRendered = setInterval(() => {
                const frame = document.querySelector('#zoom-ui-frame');
                if (frame) {
                    clearInterval(checkIfRendered);
                    // fallthrough
                } else {
                    return;
                }
                const h1 = frame.querySelector('h1');
                const div = document.createElement('div');
                div.classList.add('clozoom-dialog');
                h1.after(div);

                function renderText(text) {
                    div.textContent = text;

                    const a = document.createElement('a');
                    a.href = '#';
                    a.textContent = 'Cancel';
                    a.onclick = () => {
                        autoClose = false;
                        clearInterval(interval);
                        renderText('Clozoom won\\\'t auto-close this tab. ');
                    }
                    div.appendChild(a);
                }

                let counter = 3;
                let autoClose = true;
                const renderCounter = () => {
                    if (counter <= 0) {
                        clearInterval(interval);
                    }
                    renderText('Clozoom closing this tab in ' + counter + ' seconds... ');
                    counter--;
                }
                renderCounter();
                const interval = setInterval(renderCounter, 1000);

                setTimeout(() => {
                    if (!autoClose) return;
                    chrome.runtime.sendMessage({tabId: ${tabId}});
                }, 3000);
            }, 250);
            })()`,
        });
    })
});
