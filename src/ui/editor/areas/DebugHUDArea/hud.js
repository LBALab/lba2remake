import React from 'react';
import {extend, each, map, isEmpty, concat} from 'lodash';
import {
    saveDefaultProfile
} from './profiles';
import * as builtInProfiles from './builtInProfiles';
import {execute} from './exprDSL/execute';
import {addSlot} from './slots';
import Expression from './Expression';
import autoComplete from './exprDSL/autocomplete';
import {editor as editorStyle} from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import {Status} from './status';

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

const exprInputStyle = extend({
    width: '80%'
}, editorStyle.input);

const sectionStyle = {
    paddingBottom: 10
};

export default class DebugHUD extends FrameListener {
    static scope = {};

    constructor(props) {
        super(props);

        this.addExpression = this.addExpression.bind(this);
        this.inputKeyDown = this.inputKeyDown.bind(this);

        this.state = {
            completion: autoComplete('', DebugHUD.scope)
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
    }

    renderNormal() {
        const slots = this.props.sharedState.slots;
        const macros = map(slots.macros, (macro, key) => {
            const content = macro.expr.split('=');
            return <div key={key} style={{background: '#222222'}}>
                <button style={editorStyle.button} onClick={this.removeMacro.bind(this, key)}>-</button>
                <b> {content[0]}</b>=<i style={{color: 'darkgrey'}}>{content[1]}</i>
            </div>;
        });
        const expressions = map(slots.expressions, (expr, idx) => {
            return <div key={expr.expr}>
                <button style={editorStyle.button} onClick={this.removeExpression.bind(this, idx)}>-</button>
                <Expression expr={expr} addExpression={this.addExpression}/>
            </div>;
        });
        return <div>
            {this.renderHeader()}
            <div style={mainStyle}>
                {macros.length > 0
                    ? <div style={sectionStyle}>{macros}</div>
                    : null}
                {expressions.length > 0
                    ? <div style={sectionStyle}>{expressions}</div>
                    : null}
            </div>
        </div>;
    }

    renderLoadScreen() {
        const profiles = this.props.sharedState.profiles;
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
            {map(profiles, (profile, name) => {
                return <div key={name} style={{cursor: 'pointer'}}>
                    <button style={editorStyle.button} onClick={() => removeProfile(name)}>-</button>
                    &nbsp;
                    <span onClick={() => loadProfile(profile, name)}>{name}</span>
                </div>;
            })}
        </div>;
    }

    renderSaveScreen() {
        const profiles = this.props.sharedState.profiles;
        const {saveProfile, removeProfile} = this.props.stateHandler;
        return <div style={{padding: 16}}>
            {map(profiles, (profile, name) => {
                return <div key={name} style={{cursor: 'pointer'}}>
                    <button style={editorStyle.button} onClick={() => removeProfile(name)}>-</button>
                    &nbsp;
                    <span onClick={() => saveProfile(name)}>{name}</span>
                </div>;
            })}
        </div>;
    }

    renderHeader() {
        return <div style={headerStyle}>
            <input ref={ref => this.input = ref}
                   style={exprInputStyle}
                   list="dbgHUD_completion"
                   spellCheck={false}
                   onKeyDown={this.inputKeyDown}
                   onKeyUp={e => e.stopPropagation()}
            />
            <datalist id="dbgHUD_completion">
                {map(this.state.completion, (value, idx) => <option key={idx} value={value}/>)}
            </datalist>
            <button style={editorStyle.button} onClick={() => this.addExpression}>+</button>
        </div>;
    }

    frame() {
        const slots = this.props.sharedState.slots;
        const {macros, expressions} = slots;
        each(expressions, expr => {
            try {
                expr.value = execute(expr.program, [DebugHUD.scope], macros);
                delete expr.error;
            }
            catch (e) {
                expr.error = e;
                delete expr.value;
            }
        });
        this.props.stateHandler.setSlots(slots);
    }

    inputKeyDown(event) {
        event.stopPropagation();
        const key = event.code || event.which || event.keyCode;
        const completion = autoComplete(this.input.value, DebugHUD.scope);
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
                this.setState({completion: autoComplete('', DebugHUD.scope)});
            }
            saveDefaultProfile(slots);
        }
    }

    removeMacro(macro) {
        const slots = this.props.sharedState.slots;
        delete slots.macros[macro];
        this.props.stateHandler.setSlots(slots);
        saveDefaultProfile(slots);
    }

    removeExpression(index) {
        const slots = this.props.sharedState.slots;
        delete slots.expressions.splice(index, 1);
        this.props.stateHandler.setSlots(slots);
        saveDefaultProfile(slots);
    }
}
