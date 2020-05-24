import * as React from 'react';
import { editor } from '../../../../styles';
import { TickerProps } from '../../../../utils/Ticker';
import ScriptsEditorToolbar from './ScriptsEditorToolbar';
import BlocksEditor from './blocks/BlocksEditor';
import TextEditor from './text/TextEditor';
import VariablesPanel from './VariablesPanel';

interface Props extends TickerProps {
    editor: any;
    sharedState: any;
    stateHandler: any;
}

interface State {
    showVariables: boolean;
    scene: any;
}

const expandPanelStyle = {
    position: 'absolute' as const,
    top: 21,
    margin: 4,
    padding: 2,
    paddingRight: 4,
    background: 'rgba(0, 0, 0, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: 5,
    boxShadow: '2px 2px 6px 0px rgba(255, 255, 255, 0.15)',
    color: 'white',
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    cursor: 'pointer',
    userSelect: 'none' as const
};

const expandToolboxStyle = {
    ...expandPanelStyle,
    left: 0,
};

const expandVariablesStyle = {
    ...expandPanelStyle,
    right: 0,
};

const iconStyle = Object.assign({}, editor.icon, {
    width: 16,
    height: 16,
    padding: '0 3px',
});

export default class ScriptsEditorContent extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.toggleVariablesPanel = this.toggleVariablesPanel.bind(this);
        this.renderToolbar = this.renderToolbar.bind(this);
        this.state = {
            showVariables: false,
            scene: null
        };
    }

    toggleVariablesPanel() {
        this.setState({
            showVariables: !this.state.showVariables
        });
    }

    render() {
        return <div>
            {this.renderEditor()}
            {this.renderVariablesPanel()}
        </div>;
    }

    renderEditor() {
        if (this.props.sharedState.mode === 'text') {
            return <TextEditor
                        editor={this.props.editor}
                        ticker={this.props.ticker}
                        sharedState={this.props.sharedState}
                        stateHandler={this.props.stateHandler}
                        hideVariablesPanel={() => this.setState({ showVariables: false })}
                        renderToolbar={this.renderToolbar} />;
        }
        return <BlocksEditor
                    ticker={this.props.ticker}
                    sharedState={this.props.sharedState}
                    stateHandler={this.props.stateHandler}
                    toggleVariablesPanel={this.toggleVariablesPanel}
                    hideVariablesPanel={() => this.setState({ showVariables: false })}
                    renderToolbar={this.renderToolbar} />;
    }

    renderToolbar(props) {
        return <React.Fragment>
            <ScriptsEditorToolbar
                ticker={this.props.ticker}
                sharedState={this.props.sharedState}
                stateHandler={this.props.stateHandler}
                compile={props.compile}
                clearWorkspace={props.clearWorkspace} />
            {this.props.sharedState.mode !== 'text' &&
                <div style={expandToolboxStyle} onClick={props.expandToolbox}>
                    <img style={iconStyle} src="editor/icons/blockly.svg"/>
                    Blocks
                </div>}
            <div style={expandVariablesStyle} onClick={this.toggleVariablesPanel}>
                <img style={iconStyle} src="editor/icons/var.svg"/>
                Variables
            </div>
        </React.Fragment>;
    }

    renderVariablesPanel() {
        const variablesStyle = {
            transform: `translateX(${this.state.showVariables ? '0px' : '100%'})`,
            transition: 'transform 0.5s',
            position: 'absolute' as const,
            right: 0,
            top: 21,
            bottom: 0,
            zIndex: 80,
            minWidth: '120px',
            width: '40%'
        };
        return <div style={variablesStyle}>
            <VariablesPanel scene={this.state.scene}/>
        </div>;
    }
}
