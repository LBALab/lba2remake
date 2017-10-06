import React from 'react';
import {extend} from 'lodash';
import animsCSS from './CinemaEffect.css';

const bannerBase = {
    position: 'absolute',
    left: 0,
    right: 0,
    background: 'black',
};

export default function CinemaEffect(props) {
    const banner = extend({
        animation: `cinemaModeAnim${props.enabled ? 'In' : 'Out'} 3s forwards`
    }, bannerBase);
    const bannerTop = extend({top: 0}, banner);
    const bannerBottom = extend({bottom: 0}, banner);
    return <div>
        <style>{animsCSS}</style>
        <div style={bannerTop}/>
        <div style={bannerBottom}/>
    </div>;
}
