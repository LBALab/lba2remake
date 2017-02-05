const selectedActor = {};
const tabId = chrome.devtools.inspectedWindow.tabId;
let currentScene = 1;

let settings = {
    zones: false,
    points: false,
    labels: false
};

const backgroundPageConnection = chrome.runtime.connect({
    name: "panel"
});

backgroundPageConnection.postMessage({
    type: 'init',
    tabId: tabId
});

backgroundPageConnection.onMessage.addListener(function(message) {
    switch (message.type) {
        case 'setScene':
            setScene(message);
            break;
        case 'setActorScripts':
            document.querySelector('#actor').value = message.index;
            setActorScript('life', message.life);
            setActorScript('move', message.move);
            break;
        case 'setCurrentLine':
            setCurrentLine(message);
            break;
        case 'setSettings':
            settings = message.settings;
            document.querySelectorAll('input[type=checkbox]').forEach(function(input) {
                input.checked = settings[input.id];
            });
            break;
    }
});

document.querySelectorAll('input[type=checkbox]').forEach(function(input) {
    input.addEventListener('change', function() {
        settings[input.id] = input.checked;
        backgroundPageConnection.postMessage({
            type: 'updateSettings',
            settings: settings,
            tabId: tabId
        });
    });
});

document.querySelector('#actor').addEventListener('change', function() {
    backgroundPageConnection.postMessage({
        type: 'selectActor',
        index: parseInt(this.value),
        tabId: tabId
    });
    selectedActor[currentScene] = parseInt(this.value);
});

function setScene(message) {
    document.querySelector('#scene').innerText = 'Scene: #' + message.index;
    const actors = [];
    for (let i = 0; i < message.actors; ++i) {
        actors.push('<option value="' + i + '"' + (selectedActor[message.index] == i ? ' selected>' : '>') + i + '</option>');
    }
    document.querySelector('#actor').innerHTML = actors.join('');
    backgroundPageConnection.postMessage({
        type: 'selectActor',
        index: selectedActor[message.index] || 0,
        tabId: tabId
    });
    currentScene = message.index;
}

const cmdClasses = {
    IF: 'conditional',
    ELSE: 'conditional',
    SNIF: 'conditional',
    NEVERIF: 'conditional',
    SWIF: 'conditional',
    ONEIF: 'conditional',
    OR_IF: 'conditional',
    AND_IF: 'conditional',
    SWITCH: 'conditional',
    CASE: 'conditional',
    OR_CASE: 'conditional',
    ENDIF: 'conditional',

    COMPORTEMENT: 'structural',
    END_COMPORTEMENT: 'structural',
    END: 'structural',
    LABEL: 'structural',

    '[INVALID COMMAND]': 'invalid'
};

function getCmdClass(cmd) {
    if (cmd in cmdClasses) {
        return ' class="' + cmdClasses[cmd] + '"';
    }
    return '';
}

function setActorScript(type, script) {
    const elem = document.querySelector('#' + type + 'Script');
    elem.innerHTML = script.commands.map(function(command, idx) {
        let indent = '';
        let cmd = '<span' + getCmdClass(command.name) + '>' + command.name + '</span>';
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
            args = command.args.filter(arg => !arg.hide).map(function(arg) {
                return '&nbsp;<span class="arg">' + arg.value + '</span>';
            }).join('');
        }
        return '<div class="line">'
            + '<div class="num">' + (idx + 1) + '</div>'
            + '<div class="command">' + indent + cmd + condition + args + '</div>'
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
