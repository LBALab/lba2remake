const backgroundPageConnection = chrome.runtime.connect({
    name: "panel"
});

backgroundPageConnection.postMessage({
    type: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

backgroundPageConnection.onMessage.addListener(function(message) {
    switch (message.type) {
        case 'setScene':
            document.querySelector('#scene').innerText = 'Scene: #' + message.index;
            const actors = [];
            for (let i = 0; i < message.actors; ++i) {
                actors.push('<option>' + i + '</option>');
            }
            document.querySelector('#actor').innerHTML = actors.join('');
            backgroundPageConnection.postMessage({
                type: 'selectActor',
                index: 0,
                tabId: chrome.devtools.inspectedWindow.tabId
            });
            break;
    }
});
