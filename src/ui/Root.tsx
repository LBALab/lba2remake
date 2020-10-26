import * as React from 'react';

import GameWindow from './GameWindow';
import Editor from './Editor';
import Popup from './Popup';
import { getParams } from '../params';
import {
    loadGameMetaData,
    loadModelsMetaData,
    loadIslandsMetaData
} from './editor/DebugData';
import ChangeLog from './ChangeLog';
import Disclaimer from './Disclaimer';
import Ticker from './utils/Ticker';
import WebXRPolyfill from 'webxr-polyfill';
import { tr } from '../lang';
import Loader from './game/Loader';

interface RootProps {
    ticker: Ticker;
}

interface RootState {
    changelog: boolean;
    loading: boolean;
    vrSupported: boolean;
    vrDisabled: boolean;
    vrSession: any;
    showDisclaimer: boolean;
}

declare global {
    interface Window {
        vrSession?: any;
    }
}

export default class Root extends React.Component<RootProps, RootState> {
    state: any;

    constructor(props) {
        super(props);
        this.state = {
            changelog: false,
            loading: true,
            vrSupported: false,
            vrDisabled: false,
            showDisclaimer: localStorage.getItem('disclaimerShown') !== 'yes'
        };
        this.onHashChange = this.onHashChange.bind(this);
        this.closeChangeLog = this.closeChangeLog.bind(this);
        this.openChangeLog = this.openChangeLog.bind(this);
        this.onSessionEnd = this.onSessionEnd.bind(this);
        this.requestPresence = this.requestPresence.bind(this);
        this.exitVR = this.exitVR.bind(this);
        this.playOnScreen = this.playOnScreen.bind(this);
        this.acceptDisclaimer = this.acceptDisclaimer.bind(this);
        if (getParams().editor) {
            loadGameMetaData();
            loadModelsMetaData();
            loadIslandsMetaData();
        }
    }

    componentWillMount() {
        window.addEventListener('hashchange', this.onHashChange);
        document.addEventListener('displaychangelog', this.openChangeLog);

        // If WebXR is not supported, try loading the Polyfill.
        if (!('xr' in navigator)) {
          // Don't support mobile devices without controllers i.e. cardboard.
          new WebXRPolyfill({cardboard: false});
        }

        if ('xr' in navigator) {
            (navigator as any).xr.isSessionSupported('immersive-vr')
                .then((supported: boolean) => {
                    this.setState({
                        vrSupported: supported,
                        loading: false
                    });
                })
                .catch(() => {
                    this.setState({
                        vrSupported: false,
                        loading: false
                    });
                });
        } else {
            this.setState({
                loading: false
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChange);
        document.removeEventListener('displaychangelog', this.openChangeLog);
    }

    onHashChange() {
        getParams(true);
        this.forceUpdate();
    }

    openChangeLog() {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
        this.setState({ changelog: true });
    }

    closeChangeLog() {
        this.setState({ changelog: false });
    }

    acceptDisclaimer() {
        localStorage.setItem('disclaimerShown', 'yes');
        this.setState({ showDisclaimer: false });
    }

    render() {
        if (this.state.showDisclaimer) {
            return <Disclaimer accept={this.acceptDisclaimer}/>;
        }
        let content;
        if (this.state.loading) {
            content = <Loader/>;
        } else {
            const { vrSupported, vrDisabled, vrSession } = this.state;
            const vrActive = vrSession && vrSession.visibilityState !== 'hidden';
            if (getParams().editor) {
                content = <Editor ticker={this.props.ticker} />;
            } else if (!vrSupported || vrDisabled || vrActive) {
                content = <GameWindow
                    ticker={this.props.ticker}
                    vrSession={vrSession}
                />;
            } else {
                content = this.renderVRSelector();
            }
        }
        return <React.Fragment>
            {content}
            <Popup/>
            {this.state.changelog ?
                <ChangeLog fullscreen title close={this.closeChangeLog}/> : null}
        </React.Fragment>;
    }

    async requestPresence() {
        const vrSession = await (navigator as any).xr.requestSession('immersive-vr');
        vrSession.addEventListener('end', this.onSessionEnd);
        window.vrSession = vrSession;
        this.setState({ vrSession });
    }

    onSessionEnd() {
        if (this.state.vrSession) {
            this.state.vrSession.removeEventListener('end', this.onSessionEnd);
        }
        window.vrSession = null;
        this.setState({ vrSession: null });
    }

    async exitVR() {
        this.state.vrSession.removeEventListener('end', this.onSessionEnd);
        await this.state.vrSession.end();
        window.vrSession = null;
        this.setState({ vrSession: null });
    }

    playOnScreen() {
        this.setState({ vrDisabled: true });
    }

    renderVRSelector() {
        const buttonWrapperStyle = {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            bottom: 20,
            textAlign: 'center' as const,
            verticalAlign: 'middle' as const
        };
        const imgStyle = {
            width: 200,
            height: 200
        };
        const buttonStyle = {
            color: 'white',
            background: 'rgba(32, 162, 255, 0.5)',
            userSelect: 'none' as const,
            cursor: 'pointer' as const,
            display: 'inline-block' as const,
            fontFamily: 'LBA',
            padding: 20,
            textShadow: 'black 3px 3px',
            border: '2px outset #61cece',
            borderRadius: '15px',
            fontSize: '30px',
            textAlign: 'center' as const,
            verticalAlign: 'middle' as const
        };
        const buttonStyle2 = Object.assign({}, buttonStyle, {
            padding: 10,
            fontSize: '20px'
        });
        return <div className="bgMenu fullscreen">
            <div style={buttonWrapperStyle}>
                <div style={buttonStyle} onClick={this.requestPresence}>
                    <img style={imgStyle} src="images/vr_goggles.png"/>
                    <br/>
                    {tr('PlayInVR')}
                </div>
                <br/><br/>
                {<div style={buttonStyle2} onClick={this.playOnScreen}>
                    {tr('PlayOnScreen')}
                </div>}
            </div>
        </div>;
    }
}
