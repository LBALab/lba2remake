import React from 'react';
import {map, extend} from 'lodash';
import {makeContentComponent} from '../OutlinerArea/content';
import {InspectorNode} from './node';
import {editor} from '../../../styles';
import DebugData from '../../DebugData';
import {getParamNames} from './utils';
import {Value} from './value';

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

const watchStyle = {
    position: 'relative',
    background: editor.base.background,
    margin: '16px 12px',
    border: '1px solid grey',
    borderRadius: 8
};

const trashIconStyle = {
    position: 'absolute',
    right: -11,
    top: -11,
    cursor: 'pointer',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: 4
};

const funcEditorStyle = extend({}, mainStyle, {
    padding: 16
});

const contentStyle = {
    position: 'relative'
};

const getValue = (path, baseScope) => {
    let scope = baseScope;
    for (let i = 0; i < path.length; i += 1) {
        const p = path[i];
        if (p in scope) {
            scope = scope[p];
        } else {
            return undefined;
        }
    }
    return scope;
};

export class InspectorContent extends React.Component {
    constructor(props) {
        super(props);
        const addWatch = props.stateHandler.addWatch;
        this.editParams = this.editParams.bind(this);
        this.content = makeContentComponent(InspectorNode('DBG', addWatch, this.editParams), null, null, 'dot');
        this.watchContent = makeContentComponent(InspectorNode('DBG', addWatch, this.editParams), null, contentStyle, 'dot');
        this.browseContent = makeContentComponent(InspectorNode('DBG', null, this.editParams), null, contentStyle, 'dot');
        this.state = {
            editParams: null
        };
    }

    editParams(path, parent) {
        this.setState({
            editParams: {
                path,
                parent,
                params: []
            }
        });
        this.props.stateHandler.setTab('func');
    }

    render() {
        return <div>
            {this.renderHeader()}
            {this.renderContent()}
        </div>;
    }

    renderContent() {
        const tab = this.props.sharedState.tab || 'explore';
        if (tab === 'explore') {
            return this.renderExplorer();
        } else if (tab === 'watch') {
            return this.renderWatches();
        } else if (tab === 'func') {
            return this.renderFuncEditor();
        }
        return null;
    }

    renderExplorer() {
        return <div style={mainStyle}>
            {React.createElement(this.content, this.props)}
        </div>;
    }

    renderWatches() {
        const watches = this.props.sharedState.watches;
        const watchesStyle = extend({}, mainStyle, {
            background: watches.length > 0 ? 'black' : 'inherit',
            padding: 0,
        });
        return <div style={watchesStyle}>
            {(!watches || watches.length === 0) && <div style={{margin: 25, textAlign: 'center'}}>
                Nothing to watch just yet...
            </div>}
            {map(watches, (w, idx) => {
                const props = {
                    sharedState: {
                        path: w.path,
                        watchID: w.id
                    },
                    stateHandler: {
                        setPath: (path) => {
                            this.props.stateHandler.setPath(path);
                            this.props.stateHandler.setTab('explore');
                        },
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

    renderHeader() {
        const tabStyle = selected => ({
            height: 20,
            lineHeight: '20px',
            padding: '0 10px',
            cursor: 'pointer',
            color: selected ? 'white' : 'grey'
        });
        const onClick = tab => this.props.stateHandler.setTab(tab);
        const watches = this.props.sharedState.watches;
        const tab = this.props.sharedState.tab || 'explore';
        return <div style={headerStyle}>
            <span style={tabStyle(tab === 'explore')} onClick={() => onClick('explore')}>Explore</span>
            <span style={tabStyle(tab === 'watch')} onClick={() => onClick('watch')}>Watch<b>[{watches.length}]</b></span>
            <span style={tabStyle(tab === 'func')} onClick={() => onClick('func')}>Function</span>
        </div>;
    }

    renderFuncEditor() {
        if (!this.state.editParams)
            return null;

        const {path, parent, params, browse} = this.state.editParams;
        const fct = getValue(path, DebugData.scope);

        if (typeof (fct) !== 'function') {
            return null;
        }

        const paramNames = getParamNames(fct);

        const titleStyle = {
            color: '#5cffa9',
            fontSize: 16,
            textAlign: 'center',
        };

        const itemStyle = {
            marginTop: 14,
            padding: 8,
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 4,
            background: 'rgb(35,35,35)',
        };

        const prefixStyle = {
            color: 'black',
            background: '#aaaaaa',
            border: '1px solid black',
            borderRadius: 2,
            paddingLeft: 4,
            verticalAlign: 'middle'
        };

        return <div style={funcEditorStyle}>
            <div style={titleStyle}>
                {path.join('.')}
                (<span style={{color: 'grey'}}>{paramNames.join(', ')}</span>)
            </div>
            {map(paramNames, (p, idx) => {
                const onChange = ({target: {value}}) => {
                    const editParams = this.state.editParams;
                    editParams.params[idx] = value;
                    this.setState({editParams});
                };

                const onKeyDown = e => e.stopPropagation();

                const pValue = this.state.editParams.params[idx];

                const onRef = (ref) => {
                    if (ref && pValue) {
                        ref.value = pValue;
                    }
                };

                const inputStyle = {
                    width: '80%',
                    verticalAlign: 'middle',
                    background: pValue && getValue(pValue.split('.'), DebugData.scope) !== undefined ? 'white' : '#ffa5a1'
                };

                const iconStyle = {
                    cursor: 'pointer',
                    padding: 0,
                    margin: 0,
                    verticalAlign: 'middle',
                    paddingLeft: 8
                };

                const onClick = () => {
                    const editParams = this.state.editParams;
                    editParams.browse = idx;
                    this.setState({editParams});
                };

                let content;
                if (browse === idx) {
                    const param = this.state.editParams.params[idx];
                    const sharedState = {
                        path: param ? param.split('.') : []
                    };
                    const props = {
                        sharedState,
                        stateHandler: {
                            setPath: (newPath) => {
                                if (newPath.length > 0) {
                                    const editParams = this.state.editParams;
                                    editParams.params[idx] = newPath.join('.');
                                    delete editParams.browse;
                                    this.setState({editParams});
                                } else {
                                    sharedState.path = newPath;
                                }
                            },
                        },
                        ticker: this.props.ticker,
                    };
                    content = <div>
                        {React.createElement(this.browseContent, props)}
                    </div>;
                } else {
                    content = <div style={{paddingTop: 8, lineHeight: '20px', verticalAlign: 'middle'}}>
                        <span style={prefixStyle}>DBG.</span>
                        <input ref={onRef} type="text" onChange={onChange} style={inputStyle} onKeyDown={onKeyDown}/>
                        <img style={iconStyle} src="editor/icons/magnifier.png" onClick={onClick}/>
                    </div>;
                }

                return <div key={idx} style={itemStyle}>
                    <div>
                        Param&nbsp;<span style={{color: 'grey'}}>{p}</span>
                    </div>
                    {content}
                </div>;
            })}
            <div style={itemStyle}>
                <div><i>Return value</i></div>
                <div style={{paddingTop: 8}}>
                    <ReturnValue params={params} parent={parent} fct={fct}/>
                </div>
            </div>
        </div>;
    }
}

// eslint-disable-next-line react/no-multi-comp
class ReturnValue extends React.Component {
    componentWillMount() {
        this.itv = setInterval(() => {
            this.forceUpdate();
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.itv);
    }

    render() {
        let returnValue;
        try {
            const pValues = map(this.props.params, (p) => {
                if (p) {
                    return getValue(p.split('.'), DebugData.scope);
                }
                return undefined;
            });
            returnValue = this.props.fct.call(this.props.parent, ...pValues);
        } catch (e) {
            returnValue = e;
        }
        return <Value value={returnValue} />;
    }
}
