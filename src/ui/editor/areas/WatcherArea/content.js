import React from 'react';
import {map, extend} from 'lodash';
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
    background: editor.base.background,
    margin: 8,
    border: '1px solid grey',
    borderRadius: 8
};

export class WatcherContent extends React.Component {
    constructor(props) {
        super(props);
        this.addWatch = this.addWatch.bind(this);
        this.content = makeContentComponent(WatcherNode('DBG', this.addWatch), null, null, 'dot');
        this.state = {
            tab: 'explore',
            watches: []
        };
    }

    addWatch(path) {
        const watches = this.state.watches;
        const watchStyle = {
            position: 'relative'
        };
        console.log(path);
        watches.push({
            path,
            content: makeContentComponent(WatcherNode('[Watch]: DBG', this.addWatch), null, watchStyle, 'dot')
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
                        {React.createElement(w.content, props)}
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
            <span style={tabStyle(this.state.tab === 'watch')} onClick={() => onClick('watch')}>Watch</span>
        </div>;
    }
}
