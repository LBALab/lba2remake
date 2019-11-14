import * as React from 'react';

import GameUI from './GameUI';
import VRGameUI from './VRGameUI';
import Editor from './Editor';
import Popup from './Popup';
import {loadParams} from '../params';
import {
    loadGameMetaData,
    loadModelsMetaData,
    loadIslandsMetaData
} from './editor/DebugData';
import ChangeLog from './ChangeLog';
import Disclaimer from './Disclaimer';
import { initLanguageConfig } from '../lang';
import Ticker from './utils/Ticker';

interface RootProps {
    ticker: Ticker;
}

export default class Root extends React.Component<RootProps> {
    state: any;

    constructor(props) {
        super(props);
        const params = loadParams();
        initLanguageConfig(params);
        this.state = {
            params,
            changelog: false,
            vr: 'getVRDisplays' in navigator ? undefined : false,
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
        if ('getVRDisplays' in navigator) {
            navigator.getVRDisplays()
                .then((displays) => {
                    this.setState({vr: displays.length > 0});
                })
                .catch(() => {
                    this.setState({vr: false});
                });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChange);
        document.removeEventListener('displaychangelog', this.openChangeLog);
    }

    onHashChange() {
        this.setState({ params: loadParams() });
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
        if (this.state.params.editor) {
            content = <Editor params={this.state.params} ticker={this.props.ticker} />;
        } else if (this.state.vr) {
            content = <VRGameUI
                params={this.state.params}
                ticker={this.props.ticker}
                exitVR={this.exitVR}
            />;
        } else if (this.state.vr === false) {
            content = <GameUI params={this.state.params} ticker={this.props.ticker} />;
        }
        return <div>
            {content}
            <Popup/>
            {this.state.changelog ?
                <ChangeLog fullscreen title close={this.closeChangeLog}/> : null}
        </div>;
    }
}
