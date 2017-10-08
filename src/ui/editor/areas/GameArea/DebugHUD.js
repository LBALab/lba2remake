import React from 'react';
import {extend} from 'lodash';
import ToolShelf, {style as tsStyle} from '../ToolShelf';

const Status = {
    NORMAL: 0,
    LOAD: 1,
    SAVE: 2
};

const exprInputStyle = extend({
    width: '80%'
}, tsStyle.input);

export default class DebugHUD extends ToolShelf {
    constructor(props) {
        super(props);
        this.newProfile = this.newProfile.bind(this);
        this.loadProfile = this.loadProfile.bind(this);
        this.saveProfile = this.saveProfile.bind(this);
        this.cancel = this.cancel.bind(this);
        this.state = {status: Status.NORMAL};
    }

    frame() {}

    renderTitle() {
        if (this.state.status === Status.NORMAL) {
            return 'DebugHUD';
        }
    }

    renderMenu() {
        switch (this.state.status) {
            case Status.NORMAL:
                return [
                    <button key="new" style={tsStyle.button} onClick={this.newProfile}>New</button>,
                    <button key="load" style={tsStyle.button} onClick={this.loadProfile}>Load</button>,
                    <button key="save" style={tsStyle.button} onClick={this.saveProfile}>Save</button>
                ];
            case Status.LOAD:
                return [
                    <button key="load" style={tsStyle.button} onClick={this.cancel}>Cancel</button>
                ];
            case Status.SAVE:
                return [
                    <input key="input" style={tsStyle.input} spellCheck={false}/>,
                    <button key="cancel" style={tsStyle.button} onClick={this.cancel}>Cancel</button>,
                    <button key="save" style={tsStyle.button}>Save</button>
                ];
        }
    }

    renderContent() {
        switch (this.state.status) {
            case Status.NORMAL:
                return this.renderNormal();
            case Status.LOAD:
                return null;
            case Status.SAVE:
                return null;
        }
    }

    renderNormal() {
        // macros
        // expressions
        return <div style={{textAlign: 'right'}}>
            <input style={exprInputStyle} list="dbgHUD_completion" spellCheck={false}/>
            <datalist id="dbgHUD_completion">
            </datalist>
            <button style={tsStyle.button}>+</button>
        </div>
    }

    newProfile() {

    }

    loadProfile() {
        this.setState({status: Status.LOAD});
    }

    saveProfile() {
        this.setState({status: Status.SAVE});
    }

    cancel() {
        this.setState({status: Status.NORMAL});
    }
}
