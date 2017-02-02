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
            setActorScript('life', message.life);
            setActorScript('move', message.move);
            break;
        case 'setCurrentLine':
            setCurrentLine(message);
            break;
    }
});

document.querySelector('#actor').addEventListener('change', function () {
    backgroundPageConnection.postMessage({
        type: 'selectActor',
        index: parseInt(this.value),
        tabId: chrome.devtools.inspectedWindow.tabId
    });
});

function setActorScript(type, script) {
    const elem = document.querySelector('#' + type + 'Script');
    elem.innerHTML = script.commands.map(function(command, idx) {
        let condition = '';
        if (command.condition) {
            condition = '&nbsp;<span class="cond">' + command.condition.name + '</span>';
        }
        return '<div class="line">'
            + '<div class="num">' + (idx + 1) + '</div>'
            + '<div class="command">' + command.name + condition + '</div>'
        + '</div>';
    }).join('\n');
    displayActiveLine(type, script.activeLine);
}

function setCurrentLine(info) {
    displayActiveLine(info.scriptType, info.line);
}

function displayActiveLine(type, line) {
    const oldLineElement = document.querySelector('#' + type + 'Script .command.active');
    if (oldLineElement) {
        oldLineElement.classList.remove('active');
    }
    const lineElements = document.querySelectorAll('#' + type + 'Script .command');
    const lineElement = lineElements[line];
    if (lineElement) {
        lineElement.classList.add('active');
    }
}
