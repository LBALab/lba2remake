import React from 'react';
import {map, extend, findIndex} from 'lodash';
import {makeContentComponent} from '../OutlinerArea/content';
import {WatcherNode} from './node';
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

export class WatcherContent extends React.Component {
    constructor(props) {
        super(props);
        this.addWatch = this.addWatch.bind(this);
        this.content = makeContentComponent(WatcherNode('DBG', this.addWatch), null, null, 'dot');
        this.watchContent = makeContentComponent(WatcherNode('DBG', this.addWatch), null, contentStyle, 'dot');
        this.state = {
            tab: 'explore',
            watches: []
        };
    }

    removeWatch(id) {
        const watches = this.state.watches;
        const idx = findIndex(watches, w => w.id === id);
        if (idx !== -1) {
            watches.splice(idx, 1);
        }
        this.setState({watches});
    }

    addWatch(path) {
        const watches = this.state.watches;
        const id = new Date().getTime();
        watches.push({
            id,
            path
        });
        this.setState({watches});
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
            const watches = this.state.watches;
            return <div style={watchesStyle}>
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
                            onClick={this.removeWatch.bind(this, w.id)}
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
        return <div style={headerStyle}>
            <span style={tabStyle(this.state.tab === 'explore')} onClick={() => onClick('explore')}>Explore</span>
            <span style={tabStyle(this.state.tab === 'watch')} onClick={() => onClick('watch')}>Watch<b>[{this.state.watches.length}]</b></span>
        </div>;
    }
}
