import * as React from 'react';
import {extend} from 'lodash';

const height = '12.5%';
const duration = 3;

const bannerBase = {
    position: 'absolute',
    left: 0,
    right: 0,
    background: 'black',
};

const animsCSS = `
@keyframes cinemaModeAnimIn {
    0% { height: 0; }
    100% { height: ${height}; }
}
@keyframes cinemaModeAnimOut {
    0% { height: ${height}; }
    100% { height: 0; }
}
`;

interface CEProps {
    enabled: boolean;
}

interface CEState {
    animate: boolean;
}

export default class CinemaEffect extends React.Component<CEProps, CEState> {
    timeout?: NodeJS.Timeout;

    constructor(props) {
        super(props);
        this.state = {animate: false};
        this.timeout = null;
    }

    componentWillReceiveProps(newProps) {
        if (newProps.enabled !== this.props.enabled) {
            this.setState({animate: true});
            this.timeout = setTimeout(() => {
                this.setState({animate: false});
                this.timeout = null;
            }, duration * 1000);
        }
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    render() {
        const enabled = this.props.enabled;
        const banner = extend({
            height: enabled ? height : 0,
            animation: this.state.animate
                ? `cinemaModeAnim${enabled ? 'In' : 'Out'} ${duration}s forwards`
                : undefined
        }, bannerBase);
        const bannerTop = extend({top: 0}, banner);
        const bannerBottom = extend({bottom: 0}, banner);
        return <div>
            <style>{animsCSS}</style>
            <div style={bannerTop}/>
            <div style={bannerBottom}/>
        </div>;
    }
}
