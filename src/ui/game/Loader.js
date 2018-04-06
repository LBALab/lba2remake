import React from 'react';
import {extend, isEmpty, map} from 'lodash';
import {fullscreen} from '../styles/index';
import Ribbon from './Ribbon';

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
        const content = isEmpty(this.state.components)
            ? null
            : <span className="lds-subtext" style={{clear: 'both'}}><br/>
                {map(this.state.components, (progress, name) => <span key={name} style={{fontSize: '12px'}}>
                    <span style={{float: 'left', fontStyle: 'normal'}}>{name}</span>&nbsp;
                    <span style={{float: 'right'}}>{progress}</span><br/>
                </span>)}
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
                    <span className="lds-title">Loading</span><br/>
                    {content}
                </div>
            </div>
            <Ribbon loader/>
        </div>;
    }
}
