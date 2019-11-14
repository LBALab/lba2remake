import * as React from 'react';
import Popup from '../Popup';
import { string } from 'prop-types';

const popup_style = {
    background: 'rgb(45, 45, 48)',
    border: '2px solid black',
    color: 'white',
    padding: 25
};

const header_style = {
    padding: 0,
    margin: 0
};

const form_line = {
    padding: '5px 0'
};

const button_style = {
    padding: '5px 15px',
    marginLeft: 5,
    fontSize: '1.1em'
};

function validateId(auth) {
    if (!auth.id) {
        localStorage.removeItem('editor_auth');
        return null;
    }
    return auth;
}

export async function checkAuth() {
    const raw_auth = localStorage.getItem('editor_auth');
    try {
        if (raw_auth) {
            const auth = validateId(JSON.parse(raw_auth));
            return auth;
        }
    } catch (e) {
        // continue regardless of error
    }

    return new Promise((resolve) => {
        const onValidate = (auth) => {
            if (auth) {
                localStorage.setItem('editor_auth', JSON.stringify(auth));
            }
            resolve(auth);
        };
        Popup.display(props => <AuthPopup onValidate={onValidate} {...props}/>);
    });
}

export function getAuthQueryString() {
    const raw_auth = localStorage.getItem('editor_auth');
    try {
        if (raw_auth) {
            const auth = validateId(JSON.parse(raw_auth));
            if (auth) {
                return `?userId=${auth.id}`;
            }
        }
    } catch (e) {
        // continue regardless of error
    }
    return '';
}

function stopPropagation(e) {
    e.stopPropagation();
}

interface Props {
    close: Function;
    onValidate: Function;
}

interface State {
    authData: {
        id?: number;
        name: string;
        email: string;
        nocredit: boolean;
    };
    clickedSend: boolean;
}

class AuthPopup extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.cancel = this.cancel.bind(this);
        this.send = this.send.bind(this);
        this.state = {
            authData: {
                name: '',
                email: '',
                nocredit: false
            },
            clickedSend: false
        };
    }

    cancel() {
        this.props.close();
        this.props.onValidate();
    }

    send() {
        const auth = this.state.authData;
        if ((auth.name || auth.nocredit) && validateEmail(auth.email)) {
            auth.id = new Date().getTime();
            if (!auth.name) {
                auth.name = `anonymous_${auth.id}`;
            }
            if (!auth.email) {
                auth.email = `${auth.id}@lba2remake.net`;
            }
            this.props.close();
            this.props.onValidate(auth);
        } else {
            this.setState({clickedSend: true});
        }
    }

    onChange(field, event) {
        const authData = this.state.authData;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        authData[field] = value;
        this.setState({authData});
    }

    render() {
        const auth = this.state.authData;
        return <div style={popup_style}>
            <h1 style={header_style}>Contributor information</h1>
            <p>
                You have just started editing the game metadata.<br/>
                Your changes will be sent to the project authors for review.<br/>
                Please provide your name so we can credit you for these changes.<br/>
                Thanks for contributing!
            </p>
            <div style={form_line}>
                <label style={{paddingRight: 20}}>Name:</label>
                <input
                    type="text"
                    value={auth.name}
                    onChange={this.onChange.bind(this, 'name')}
                    onKeyDown={stopPropagation}
                />
            </div>
            <div style={form_line}>
                <label style={{paddingRight: 20}}>Email:</label>
                <input
                    type="text"
                    value={auth.email}
                    onChange={this.onChange.bind(this, 'email')}
                    onKeyDown={stopPropagation}
                />
            </div>
            <div style={form_line}>
                <input type="checkbox"
                        onChange={this.onChange.bind(this, 'nocredit')}
                        checked={auth.nocredit}/>
                <label style={{paddingLeft: 10}}>
                    I DO NOT want to be credited for my contributions<br/>
                    (only check this if you don&apos;t want your name
                    to appear in our contributor list)
                </label>
            </div>
            <br/>
            {this.renderWarnings(auth)}
            <div style={{float: 'right'}}>
                <button style={button_style} onClick={this.cancel}>Cancel</button>
                <button style={button_style} onClick={this.send}>Send</button>
            </div>
            <div style={{clear: 'both'}}/>
        </div>;
    }

    renderWarnings(auth) {
        if (this.state.clickedSend) {
            if (!(auth.name || auth.nocredit)) {
                return <p style={{color: 'red'}}>
                    You should either choose not to be credited or fill in your name.
                </p>;
            }
            if (!validateEmail(auth.email)) {
                return <p style={{color: 'orange'}}>
                    Invalid email address.
                </p>;
            }
        }
        return null;
    }
}

function validateEmail(email) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !email || re.test(email.toLowerCase());
}
