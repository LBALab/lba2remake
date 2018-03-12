import Popup from "../Popup";
import React from "react";

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

export function checkAuth(callback) {
    let auth = null;
    const raw_auth = localStorage.getItem('editor_auth');
    try {
        if (raw_auth)
        {
            auth = JSON.parse(raw_auth);
        }
    }
    catch (e) {}

    if (auth) {
        callback(auth);
    } else {
        Popup.display((props) => <AuthPopup callback={callback} {...props}/>);
    }
}

class AuthPopup extends React.Component {
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
            warning: false
        };
    }

    cancel() {
        this.props.close();
        this.props.callback();
    }

    send() {
        if (this.state.authData.name || this.state.authData.nocredit) {
            this.props.close();
            this.props.callback(this.state.authData);
        } else {
            this.setState({warning: true});
        }
    }

    onChange(field, event) {
        const authData = this.state.authData;
        authData[field] = event.target.value;
        this.setState({authData});
    }

    render() {
        const auth = this.state.authData;
        const warning = this.state.warning
            ? <p style={{color: 'red'}}>
                You should either choose not to be credited or fill in your name.
            </p>
            : null;
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
                <input type="text" value={auth.name} onChange={this.onChange.bind(this, 'name')}/>
            </div>
            <div style={form_line}>
                <label style={{paddingRight: 20}}>Email:</label>
                <input type="text" value={auth.email} onChange={this.onChange.bind(this, 'email')}/>
            </div>
            <div style={form_line}>
                <input type="checkbox" value={auth.nocredit} onChange={this.onChange.bind(this, 'nocredit')}/>
                <label style={{paddingLeft: 10}}>I DO NOT want to be credited for my contributions<br/>
                    (only check this if you don't want your name to appear in our contributor list)</label>
            </div>
            <br/>
            {warning}
            <div style={{float: 'right'}}>
                <button style={button_style} onClick={this.cancel}>Cancel</button>
                <button style={button_style} onClick={this.send}>Send</button>
            </div>
            <div style={{clear: 'both'}}/>
        </div>;
    }
}