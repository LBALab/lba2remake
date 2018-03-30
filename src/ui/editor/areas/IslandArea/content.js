import React from 'react';
import {createRenderer} from '../../../../renderer';
import {fullscreen} from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';

export default class Island extends FrameListener {
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);

        if (props.mainData) {
            this.state = props.mainData.state;
        } else {
            this.state = {};
        }
    }

    saveData() {
        if (this.props.saveMainData) {
            this.props.saveMainData({
                state: this.state,
                canvas: this.canvas
            });
        }
    }

    onLoad(root) {
        if (!this.root) {
            if (this.props.mainData) {
                this.canvas = this.props.mainData.canvas;
            } else {
                this.canvas = document.createElement('canvas');
                this.canvas.tabIndex = 0;
                const renderer = createRenderer(this.props.params, this.canvas);
                this.setState({ renderer }, this.saveData);
            }
            this.root = root;
            this.root.appendChild(this.canvas);
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.params.vr !== this.props.params.vr && this.canvas) {
            this.state.renderer.dispose();
            this.setState({
                renderer: createRenderer(newProps.params, this.canvas)
            }, this.saveData);
        }
    }

    frame() {
        this.checkResize();
    }

    checkResize() {
        if (this.root && this.canvas && this.state.renderer) {
            const roundedWidth = Math.floor(this.root.clientWidth * 0.5) * 2;
            const roundedHeight = Math.floor(this.root.clientHeight * 0.5) * 2;
            const rWidth = `${roundedWidth}px`;
            const rHeight = `${roundedHeight}px`;
            const cvWidth = this.canvas.style.width;
            const cvHeight = this.canvas.style.height;
            if (rWidth !== cvWidth || rHeight !== cvHeight) {
                this.state.renderer.resize(roundedWidth, roundedHeight);
            }
        }
    }

    render() {
        return <div style={fullscreen}>
            <div ref={this.onLoad} style={fullscreen}/>
            <div id="stats1" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
            <div id="stats2" style={{position: 'absolute', top: 0, left: '50%', width: '50%'}}/>
        </div>;
    }
}
