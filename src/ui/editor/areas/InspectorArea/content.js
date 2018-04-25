import React from 'react';
import {map, extend} from 'lodash';
import {makeContentComponent} from '../OutlinerArea/content';
import {InspectorNode} from './node';
import {editor} from '../../../styles';

const headerStyle = {
    position: 'absolute',
    height: 20,
    top: 0,
    left: 0,
    right: 0,
    padding: 4,
    textAlign: 'left',
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

const watchesStyle = extend({}, mainStyle, {
    background: 'black',
    padding: 0,
});

const watchStyle = {
    position: 'relative',
    background: editor.base.background,
    margin: 8,
    border: '1px solid grey',
    borderRadius: 8
};

const trashIconStyle = {
    position: 'absolute',
    right: 8,
    top: 8,
    cursor: 'pointer'
};

const contentStyle = {
    position: 'relative'
};

export class InspectorContent extends React.Component {
    constructor(props) {
        super(props);
        const addWatch = props.stateHandler.addWatch;
        this.content = makeContentComponent(InspectorNode('DBG', addWatch), null, null, 'dot');
        this.watchContent = makeContentComponent(InspectorNode('DBG', addWatch), null, contentStyle, 'dot');
        this.state = {
            tab: 'explore'
        };
    }

    render() {
        return <div>
            {this.renderHeader()}
            {this.renderContent()}
        </div>;
    }

    renderContent() {
        if (this.state.tab === 'explore') {
            return <div style={mainStyle}>
                {React.createElement(this.content, this.props)}
            </div>;
        } else if (this.state.tab === 'watch') {
            const watches = this.props.sharedState.watches;
            return <div style={watchesStyle}>
                {(!watches || watches.length === 0) && <div style={{margin: 25, textAlign: 'center'}}>
                    Nothing to watch just yet...
                </div>}
                {map(watches, (w, idx) => {
                    const props = {
                        sharedState: {
                            path: w.path
                        },
                        stateHandler: {
                            setPath: () => {},
                        },
                        ticker: this.props.ticker,
                    };
                    return <div key={idx} style={watchStyle}>
                        {React.createElement(this.watchContent, props)}
                        <img
                            style={trashIconStyle}
                            src="editor/icons/trash.png"
                            onClick={this.props.stateHandler.removeWatch.bind(null, w.id)}
                        />
                    </div>;
                })}
            </div>;
        }
        return null;
    }

    renderHeader() {
        const tabStyle = selected => ({
            height: 20,
            lineHeight: '20px',
            padding: '0 10px',
            cursor: 'pointer',
            color: selected ? 'white' : 'grey'
        });
        const onClick = tab => this.setState({tab});
        const watches = this.props.sharedState.watches;
        return <div style={headerStyle}>
            <span style={tabStyle(this.state.tab === 'explore')} onClick={() => onClick('explore')}>Explore</span>
            <span style={tabStyle(this.state.tab === 'watch')} onClick={() => onClick('watch')}>Watch<b>[{watches.length}]</b></span>
        </div>;
    }
}
