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
        Popup.display(makeAuthPopup(callback));
    }
}

function makeAuthPopup(callback) {
    return function AuthPopup(props) {
        const cancel = () => {
            props.close();
            callback();
        };

        const send = () => {
            props.close();
            // TODO: Save auth data
            callback({});
        };

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
                <input/>
            </div>
            <div style={form_line}>
                <label style={{paddingRight: 20}}>Email:</label>
                <input/>
            </div>
            <div style={form_line}>
                <input type="checkbox"/>
                <label style={{paddingLeft: 10}}>I DO NOT want to be credited for my contributions<br/>
                    (only check this if you don't want your name to appear in our contributor list)</label>
            </div>
            <br/>
            <div style={{float: 'right'}}>
                <button style={button_style} onClick={cancel}>Cancel</button>
                <button style={button_style} onClick={send}>Send</button>
            </div>
            <div style={{clear: 'both'}}/>
        </div>;
    };
}
