import Popup from "../Popup";
import React from "react";

const popup_style = {
    background: 'rgb(45, 45, 48)',
    border: '2px solid black',
    color: 'white',
    padding: 25
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
        const close = () => {
            props.close();
            saveAuthData();
            callback({});
        };

        return <div style={popup_style}>
            <h1>Contributor information</h1>
            You have just started editing the game metadata.<br/>
            Your changes will be sent to the project authors for review.<br/>
            Please provide your name so we can credit you for these changes.<br/>
            Thanks for contributing!
            <button onClick={close}>Close!</button>
        </div>;
    };
}

function saveAuthData(auth) {

}
