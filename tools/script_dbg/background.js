const panelConnections = {};
const contentConnections = {};
const scenes = {};
let paused = false;
let settings = null;

chrome.runtime.onConnect.addListener(function(port) {
    const panelListener = function(message) {
        console.log('msgFromPanel: ', message);
        switch (message.type) {
            case 'init':
                panelConnections[message.tabId] = port;
                if (message.tabId in scenes) {
                    port.postMessage(scenes[message.tabId]);
                }
                if (settings) {
                    port.postMessage({
                        type: 'setSettings',
                        settings: settings
                    })
                }
                port.postMessage({
                    type: 'setPaused',
                    paused: paused
                });
                break;
            case 'updateSettings':
                settings = message.settings;
                break;
            case 'setPaused':
                paused = message.paused;
                break;
        }
        if (message.type != 'init' && message.tabId in contentConnections) {
            contentConnections[message.tabId].postMessage(message);
        }
    };

    const contentListener = function(message) {
        console.log('msgFromContent: ', message);
        const tabId = port.sender.tab.id;
        switch (message.type) {
            case 'setScene':
                scenes[tabId] = message;
                if (settings) {
                    port.postMessage({
                        type: 'updateSettings',
                        settings: settings,
                        tabId: tabId
                    });
                }
                break;
        }
        if (tabId in panelConnections) {
            panelConnections[tabId].postMessage(message);
        }
    };

    if (port.sender && port.sender.tab) {
        const tabId = port.sender.tab.id;
        contentConnections[tabId] = port;
        port.postMessage({type: 'setPaused', paused: paused});
        port.onMessage.addListener(contentListener);
        port.onDisconnect.addListener(function(port) {
            port.onMessage.removeListener(contentListener);
            deletePort(contentConnections, port);
        });
    } else {
        port.onMessage.addListener(panelListener);
        port.onDisconnect.addListener(function(port) {
            port.onMessage.removeListener(panelListener);
            deletePort(panelConnections, port);
        });
    }
});

function deletePort(connections, port) {
    const tabs = Object.keys(connections);
    for (let i = 0, len = tabs.length; i < len; i++) {
        if (connections[tabs[i]] == port) {
            delete connections[tabs[i]];
            break;
        }
    }
}
