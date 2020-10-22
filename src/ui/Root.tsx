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
// import WebXRPolyfill from 'webxr-polyfill';

interface RootProps {
    ticker: Ticker;
}

export default class Root extends React.Component<RootProps> {
    state: any;

    constructor(props) {
        super(props);
        const params = getParams();
        this.state = {
            params,
            changelog: false,
            loading: true,
            vr: false,
            showDisclaimer: localStorage.getItem('disclaimerShown') !== 'yes'
        };
        this.onHashChange = this.onHashChange.bind(this);
        this.closeChangeLog = this.closeChangeLog.bind(this);
        this.openChangeLog = this.openChangeLog.bind(this);
        this.exitVR = this.exitVR.bind(this);
        this.acceptDisclaimer = this.acceptDisclaimer.bind(this);
        if (params.editor) {
            loadGameMetaData();
            loadModelsMetaData();
            loadIslandsMetaData();
        }
    }

    componentWillMount() {
        window.addEventListener('hashchange', this.onHashChange);
        document.addEventListener('displaychangelog', this.openChangeLog);

        // // If WebXR is not supported, try loading the Polyfill.
        // if (!('xr' in navigator)) {
        //   // Don't support mobile devices without controllers i.e. cardboard.
        //   new WebXRPolyfill({cardboard: false});
        // }

        if ('xr' in navigator) {
            (navigator as any).xr.isSessionSupported('immersive-vr')
                .then((supported) => {
                    this.setState({
                        vr: supported,
                        loading: false
                    });
                })
                .catch(() => {
                    this.setState({
                        vr: false,
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
        this.setState({ params: getParams(true) });
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

    exitVR() {
        this.setState({ vr: false });
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
        if (!this.state.loading) {
            if (this.state.params.editor) {
                content = <Editor params={this.state.params} ticker={this.props.ticker} />;
            } else {
                content = <GameWindow
                    ticker={this.props.ticker}
                    vr={this.state.vr}
                    exitVR={this.exitVR}
                />;
            }
        }
        return <React.Fragment>
            {content}
            <Popup/>
            {this.state.changelog ?
                <ChangeLog fullscreen title close={this.closeChangeLog}/> : null}
        </React.Fragment>;
    }
}
