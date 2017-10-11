import React from 'react';
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

export default class CinemaEffect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {animate: false};
    }

    componentWillReceiveProps(newProps) {
        if (newProps.enabled !== this.props.enabled) {
            this.setState({animate: true});
            setTimeout(() => {
                this.setState({animate: false});
            }, duration * 1000);
        }
    }

    render() {
        const enabled = this.props.enabled;
        const banner = extend({
            height: enabled ? height : 0,
            animation: this.state.animate ? `cinemaModeAnim${enabled ? 'In' : 'Out'} ${duration}s forwards` : undefined
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
