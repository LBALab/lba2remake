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
        case 'setActorScripts':
            setScript('life', message.life);
            setScript('move', message.move);
            break;
    }
});

document.querySelector('#actor').addEventListener('change', function () {
    backgroundPageConnection.postMessage({
        type: 'selectActor',
        index: parseInt(this.value),
        tabId: chrome.devtools.inspectedWindow.tabId
    })
});

function setScript(type, commands) {
    const elem = document.querySelector('#' + type + 'Script');
    elem.innerHTML = commands.map(function(command, idx) {
        return '<div class="line">'
            + '<div class="num">' + (idx + 1) + '</div>'
            + '<div class="command">' + command.name + '</div>'
        + '</div>';
    }).join('\n');
}
