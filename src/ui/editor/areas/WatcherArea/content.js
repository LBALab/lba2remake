import React from 'react';
import {extend, map} from 'lodash';
import {makeContentComponent} from '../OutlinerArea/content';
import {editor as editorStyle} from '../../../styles';
import {WatcherNode} from './node';

const headerStyle = {
    position: 'absolute',
    height: 20,
    top: 0,
    left: 0,
    right: 0,
    padding: 4,
    textAlign: 'right',
    background: '#333333',
    borderBottom: '1px solid gray'
};

const mainStyle = {
    position: 'absolute',
    bottom: 0,
    top: headerStyle.height + (headerStyle.padding * 2) + 1,
    left: 0,
    right: 0,
    padding: 4,
    overflow: 'auto'
};

const inputStyle = extend({
    width: '80%'
}, editorStyle.input);

export class WatcherContent extends React.Component {
    constructor(props) {
        super(props);
        this.content = makeContentComponent(WatcherNode('DBG'), null, null, 'dot');
        this.state = {};
    }

    render() {
        return <div>
            {this.renderHeader()}
            <div style={mainStyle}>
                {React.createElement(this.content, this.props)}
            </div>
        </div>;
    }

    renderHeader() {
        return <div style={headerStyle}>
            <input
                key="exprInput"
                ref={(ref) => {
                    this.input = ref;
                }}
                style={inputStyle}
                list="dbgHUD_completion"
                spellCheck={false}
                onKeyDown={this.inputKeyDown}
                onKeyUp={e => e.stopPropagation()}
                placeholder="<type expression>"
            />
            <datalist id="dbgHUD_completion">
                {map(this.state.completion, (value, idx) => <option key={idx} value={value}/>)}
            </datalist>
            <button style={editorStyle.button} onClick={() => this.addExpression}>+</button>
        </div>;
    }
}
