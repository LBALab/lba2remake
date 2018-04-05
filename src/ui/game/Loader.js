import React from 'react';
import {extend} from 'lodash';
import {fullscreen} from '../styles/index';

const overlay = extend({background: 'black'}, fullscreen);

export default function Loader(props) {
    const text = props.text || 'Game Data';
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
                Loading<br/>
                <span className="lds-subtext">{text}</span>
            </div>
        </div>
    </div>;
}
