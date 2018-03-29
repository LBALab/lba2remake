import React from 'react';
import {extend, map, isEmpty} from 'lodash';
import {loadProfiles} from './profiles';
import * as builtInProfiles from './builtInProfiles';
import {execute} from './exprDSL/execute';
import {addSlot} from './slots';
import Expression from './Expression';
import autoComplete from './exprDSL/autocomplete';
import {editor as editorStyle} from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import {Status} from './status';
import DebugData from '../../DebugData';

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
    top: headerStyle.height + headerStyle.padding * 2 + 1,
    left: 0,
    right: 0,
    padding: 4,
    overflow: 'auto'
};

const inputStyle = extend({
    width: '80%'
}, editorStyle.input);

const sectionStyle = {
    paddingBottom: 10
};

export default class DebugHUD extends FrameListener {
    constructor(props) {
        super(props);

        this.addExpression = this.addExpression.bind(this);
        this.inputKeyDown = this.inputKeyDown.bind(this);

        this.state = {
            completion: autoComplete('', DebugData.scope),
            values: []
        };
    }

    render() {
        switch (this.props.sharedState.status) {
            case Status.NORMAL:
                return this.renderNormal();
            case Status.LOAD:
                return this.renderLoadScreen();
            case Status.SAVE:
                return this.renderSaveScreen();
        }
        return null;
    }

    renderNormal() {
        const slots = this.props.sharedState.slots;
        const macros = map(slots.macros, (macro, key) => {
            const content = macro.expr.split('=');
            return <div key={key} style={{background: '#222222'}}>
                <button style={editorStyle.button} onClick={this.removeMacro.bind(this, key)}>
                    -
                </button>
                <b> {content[0]}</b>=<i style={{color: 'darkgrey'}}>{content[1]}</i>
            </div>;
        });
        const expressions = map(slots.expressions, (expr, idx) => <div key={expr.expr}>
            <button style={editorStyle.button} onClick={this.removeExpression.bind(this, idx)}>
                -
            </button>
            <Expression
                expr={expr}
                value={this.state.values[idx]}
                addExpression={this.addExpression}
            />
        </div>);
        return <div>
            {this.renderHeader()}
            <div style={mainStyle}>
                {macros.length > 0
                    ? <div style={sectionStyle}>{macros}</div>
                    : null}
                {expressions.length > 0
                    ? <div style={sectionStyle}>{expressions}</div>
                    : null}
                {macros.length === 0 && expressions.length === 0
                    ? <div style={{padding: '2em', color: '#AAAAAA'}}>To use the debug HUD, you can type in expressions in the input above.<br/>
                        Examples of valid expressions:<br/>
                        <br/>
                        <i style={{color: '#CCCCCC'}}>game</i><br/>
                        <i style={{color: '#CCCCCC'}}>scene.index</i><br/>
                        <i style={{color: '#CCCCCC'}}>actors = scene.actors</i><br/>
                        <i style={{color: '#CCCCCC'}}>map(actors, isVisible)</i><br/>
                        <br/>
                        You can also
                        <u onClick={() => this.props.stateHandler.setStatus(Status.LOAD)}>
                            load a preset or a saved profile.
                        </u>
                    </div>
                    : null}
            </div>
        </div>;
    }

    renderHeader() {
        return <div style={headerStyle}>
            <input
                key="exprInput"
                ref={ref => this.input = ref}
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

    renderLoadScreen() {
        const profiles = loadProfiles();
        const hasProfiles = !isEmpty(profiles);
        const {loadProfile, removeProfile} = this.props.stateHandler;
        return <div style={{padding: 16}}>
            {map(builtInProfiles, (profile, name) => {
                const style = {
                    fontStyle: 'italic',
                    cursor: 'pointer',
                    lineHeight: '22px',
                    paddingLeft: hasProfiles ? '3ch' : 0
                };
                return <div key={`builtin:${name}`} style={style} onClick={() => loadProfile(profile, name)}>{name}</div>;
            })}
            {map(profiles, (profile, name) => <div key={name} style={{cursor: 'pointer'}}>
                <button style={editorStyle.button} onClick={() => removeProfile(name)}>-</button>
                    &nbsp;
                <span onClick={() => loadProfile(profile, name)}>{name}</span>
            </div>)}
        </div>;
    }

    renderSaveScreen() {
        const profiles = loadProfiles();
        const {saveProfile, removeProfile} = this.props.stateHandler;

        const saveConfirm = (name) => {
            const confirm = this.props.confirmPopup.bind(
                null,
                <span>Are you sure you want to overwrite profile "<i>{name}</i>"?</span>,
                'Yes',
                'No'
            );
            saveProfile(confirm, name);
        };

        const onKeyDown = (event) => {
            event.stopPropagation();
            const key = event.code || event.which || event.keyCode;
            if (key === 'Enter' || key === 13) {
                event.preventDefault();
                saveConfirm(this.saveInput.value);
            }
        };

        return <div style={{padding: 16}}>
            <div style={headerStyle}>
                <input
                    key="saveInput"
                    ref={(ref) => {
                        this.saveInput = ref;
                        if (ref && !ref.value)
                            ref.value = this.props.sharedState.profileName;
                    }}
                    style={inputStyle}
                    spellCheck={false}
                    onKeyDown={onKeyDown}
                    placeholder="<type profile name>"
                />
                <button
                    style={editorStyle.button}
                    onClick={() => saveConfirm(this.saveInput.value)}
                >
                    Save
                </button>
            </div>
            <div style={mainStyle}>
                {map(profiles, (profile, name) => <div key={name} style={{cursor: 'pointer'}}>
                    <button style={editorStyle.button} onClick={() => removeProfile(name)}>
                        -
                    </button>&nbsp;
                    <span onClick={() => saveConfirm(name)}>{name}</span>
                </div>)}
            </div>
        </div>;
    }

    frame() {
        if (this.props.sharedState.status === Status.NORMAL) {
            const slots = this.props.sharedState.slots;
            const {macros, expressions} = slots;
            const values = map(expressions, (expr) => {
                try {
                    return {value: execute(expr.program, [DebugData.scope], macros)};
                } catch (error) {
                    return {error};
                }
            });
            this.setState({values});
        }
    }

    inputKeyDown(event) {
        event.stopPropagation();
        const key = event.code || event.which || event.keyCode;
        const completion = autoComplete(this.input.value, DebugData.scope);
        this.setState({completion});
        if (key === 'Enter' || key === 13) {
            this.addExpression();
            event.preventDefault();
        } else if (key === 'Tab' || key === 9) {
            if (completion.length > 0) {
                this.input.value = completion[0];
            }
            event.preventDefault();
        }
    }

    addExpression(expr = this.input.value) {
        const slots = this.props.sharedState.slots;
        if (expr && addSlot(slots, expr)) {
            if (expr === this.input.value) {
                this.input.value = '';
                this.props.stateHandler.setSlots(slots);
                this.setState({completion: autoComplete('', DebugData.scope)});
            }
        }
    }

    removeMacro(macro) {
        const slots = this.props.sharedState.slots;
        delete slots.macros[macro];
        this.props.stateHandler.setSlots(slots);
    }

    removeExpression(index) {
        const slots = this.props.sharedState.slots;
        delete slots.expressions.splice(index, 1);
        this.props.stateHandler.setSlots(slots);
    }
}
