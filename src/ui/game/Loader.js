import React from 'react';
import {extend, isEmpty, map, entries, sortBy} from 'lodash';
import {fullscreen} from '../styles/index';
import Ribbon from './Ribbon';
import {tr} from '../../lang';

const overlay = extend({background: 'black'}, fullscreen);

const loadingComponents = {};

document.addEventListener('loaderprogress', ({detail}) => {
    loadingComponents[detail.name] = detail.progress;
});

document.addEventListener('loaderend', ({detail}) => {
    delete loadingComponents[detail.name];
});

export default class Loader extends React.Component {
    constructor() {
        super();
        this.onLoadEvent = this.onLoadEvent.bind(this);
        this.renderComponent = this.renderComponent.bind(this);
        this.state = {components: loadingComponents};
    }

    componentDidMount() {
        document.addEventListener('loaderprogress', this.onLoadEvent);
        document.addEventListener('loaderend', this.onLoadEvent);
    }

    componentWillUnmount() {
        document.removeEventListener('loaderprogress', this.onLoadEvent);
        document.removeEventListener('loaderend', this.onLoadEvent);
    }

    onLoadEvent() {
        this.setState({components: loadingComponents});
    }

    render() {
        const compStyle = {
            display: 'block',
            margin: 'auto',
            padding: 0,
            width: 128,
            height: 14 * 6,
            overflow: 'hidden',
        };
        const content = !isEmpty(this.state.components)
            && <span className="lds-subtext" style={compStyle}><br/>
                {map(sortBy(entries(this.state.components), e => 1 - e[1]), this.renderComponent)}
            </span>;
        return <div style={overlay}>
            <div className="loader">
                <div className="lds-roller">
                    <div className="n1"/>
                    <div className="n2"/>
                    <div className="n3"/>
                    <div className="n4"/>
                    <div className="n5"/>
                </div>
                <div className="lds-roller inv">
                    <div className="n1"/>
                    <div className="n2"/>
                    <div className="n3"/>
                    <div className="n4"/>
                    <div className="n5"/>
                </div>
                <div className="lds-roller-text">
                    <span className="lds-title">{tr('loading')}</span><br/>
                    {content}
                </div>
            </div>
            <Ribbon mode="loader"/>
        </div>;
    }

    renderComponent([name, progress]) {
        const style = {
            position: 'relative',
            fontSize: '12px',
            height: 13,
            lineHeight: '13px',
            width: 128,
            borderBottom: '1px solid rgba(49, 89, 255, 0.2)',
            textAlign: 'center'
        };
        const nameStyle = {
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            fontStyle: 'normal',
            lineHeight: '13px',
        };
        const progStyle = {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: progress * 128,
            background: 'rgba(49, 89, 255, 0.5)'
        };
        return <div key={name} style={style}>
            <div style={progStyle}/>
            <div style={nameStyle}>{name}</div>
        </div>;
    }
}
