const selectedActor = {};
let currentScene = 1;

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
            setScene(message);
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
    selectedActor[currentScene] = parseInt(this.value);
});

function setScene(message) {
    document.querySelector('#scene').innerText = 'Scene: #' + message.index;
    const actors = [];
    for (let i = 0; i < message.actors; ++i) {
        actors.push('<option ' + (selectedActor[message.index] == i ? ' selected>' : '>') + i + '</option>');
    }
    document.querySelector('#actor').innerHTML = actors.join('');
    backgroundPageConnection.postMessage({
        type: 'selectActor',
        index: selectedActor[message.index] || 0,
        tabId: chrome.devtools.inspectedWindow.tabId
    });
    currentScene = message.index;
}

function setActorScript(type, script) {
    const elem = document.querySelector('#' + type + 'Script');
    elem.innerHTML = script.commands.map(function(command, idx) {
        let indent = '';
        for (let i = 0; i < command.indent; ++i) {
            indent += '&nbsp;&nbsp;';
        }
        let condition = '';
        if (command.condition) {
            let param = '';
            if ('param' in command.condition) {
                param = '(<span class="arg">' + command.condition.param + '</span>)';
            }
            let operatorAndOperand = '';
            if ('operator' in command.condition) {
                operatorAndOperand = '&nbsp;' + command.condition.operator.name + '&nbsp;<span class="arg">' + command.condition.operator.operand + '</span>';
            }
            condition = '&nbsp;<span class="cond">' + command.condition.name + '</span>' + param + operatorAndOperand;
        }
        let args = '';
        if (command.args) {
            args = command.args.map(function(arg) {
                return '&nbsp;<span class="arg">' + arg + '</span>';
            }).join('');
        }
        return '<div class="line">'
            + '<div class="num">' + (idx + 1) + '</div>'
            + '<div class="command">' + indent + command.name + condition + args + '</div>'
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
