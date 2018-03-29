import React from 'react';
import * as THREE from 'three';
import {map, extend, each} from 'lodash';
import FrameListener from '../utils/FrameListener';
import DebugData, {getObjectName} from './DebugData';

const POS = new THREE.Vector3();

const baseStyle = {
    position: 'absolute',
    border: '1px solid black',
    lineHeight: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold'
};

const typeStyle = {
    actor: {
        borderRadius: 6,
        background: 'rgba(205, 92, 92, 0.6)',
        fontSize: 14,
        minWidth: 16,
        minHeight: 16,
        paddingLeft: 4,
        paddingRight: 4,
        lineHeight: '18px',
        transform: 'translate(-50%, 0)'
    },
    point: {
        background: 'rgba(135, 206, 235, 0.6)',
        fontSize: 12,
        minWidth: 16,
        minHeight: 16,
        lineHeight: '16px',
        borderRadius: 3,
        transform: 'translate(-50%, 0)'
    },
    zone: {
        fontSize: 12,
        minWidth: 16,
        minHeight: 16,
        paddingLeft: 2,
        paddingRight: 2,
        lineHeight: '16px',
        transform: 'translate(-50%, -50%)'
    }
};

const selectedStyle = {
    actor: {
        opacity: 1,
        background: 'red',
        color: 'white'
    },
    point: {
        opacity: 1,
        background: 'white',
        color: 'black'
    },
    zone: {
        opacity: 1,
        background: 'white',
        color: 'black'
    }
};

export default class DebugLabels extends FrameListener {
    constructor(props) {
        super(props);
        this.state = {};
        toggleActors(this.props.scene, this.props.labels.actor);
        toggleZones(this.props.scene, this.props.labels.zone);
        togglePoints(this.props.scene, this.props.labels.point);
    }

    frame() {
        const {params, scene, renderer, labels} = this.props;
        if (params.editor && scene && renderer) {
            const items = [];
            each(labels, (enabled, type) => {
                if (enabled) {
                    this.getLabels(items, renderer, scene, type);
                }
            });
            this.setState({items});
        } else {
            this.setState({items: null});
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.scene !== this.props.scene) {
            if (this.props.labels.actor) {
                toggleActors(this.props.scene, false);
            }
            if (this.props.labels.zone) {
                toggleZones(this.props.scene, false);
            }
            if (this.props.labels.point) {
                togglePoints(this.props.scene, false);
            }
            toggleActors(newProps.scene, newProps.labels.actor);
            toggleZones(newProps.scene, newProps.labels.zone);
            togglePoints(newProps.scene, newProps.labels.point);
        } else {
            if (newProps.labels.actor !== this.props.labels.actor) {
                toggleActors(newProps.scene, newProps.labels.actor);
            }
            if (newProps.labels.zone !== this.props.labels.zone) {
                toggleZones(newProps.scene, newProps.labels.zone);
            }
            if (newProps.labels.point !== this.props.labels.point) {
                togglePoints(newProps.scene, newProps.labels.point);
            }
        }
    }

    getLabels(items, renderer, scene, type) {
        const objects = scene[`${type}s`];
        each(objects, (obj) => {
            if (obj.isVisible === false || !obj.threeObject)
                return;

            const width = renderer.canvas.clientWidth;
            const height = renderer.canvas.clientHeight;
            const widthHalf = 0.5 * width;
            const heightHalf = 0.5 * height;

            obj.threeObject.updateMatrixWorld();
            POS.setFromMatrixPosition(obj.threeObject.matrixWorld);
            POS.project(renderer.getMainCamera(scene));

            POS.x = (POS.x * widthHalf) + widthHalf;
            POS.y = -(POS.y * heightHalf) + heightHalf;

            if (POS.z < 1
                && POS.x > 0
                && POS.x < width
                && POS.y > 0
                && POS.y < height) {
                const item = {
                    id: `${scene.index}_${type}_${obj.index}`,
                    index: obj.index,
                    x: POS.x,
                    y: POS.y,
                    label: type === 'point' ? '' : getObjectName(type, scene.index, obj.index),
                    selected: DebugData.selection[type] === obj.index,
                    type
                };
                if (type === 'zone') {
                    const {r, g, b} = obj.color;
                    item.color = `rgba(${Math.floor(r * 256)},${Math.floor(g * 256)},${Math.floor(b * 256)},0.6)`;
                }
                items.push(item);
            }
        });
    }

    select(type, index) {
        if (type === 'zone' || type === 'point') {
            if (DebugData.selection[type] === index) {
                DebugData.selection[type] = -1;
            } else {
                DebugData.selection[type] = index;
            }
        } else {
            DebugData.selection[type] = index;
        }
    }

    render() {
        if (this.state.items) {
            return <div>
                {map(this.state.items, (item) => {
                    const style = extend({
                        left: `${item.x}px`,
                        top: `${item.y}px`
                    }, baseStyle, typeStyle[item.type]);
                    if (item.selected) {
                        extend(style, selectedStyle[item.type]);
                    } else if (item.color) {
                        style.background = item.color;
                    }
                    return <div
                        onClick={this.select.bind(this, item.type, item.index)}
                        key={item.id}
                        style={style}
                    >
                        {item.label} #{item.index}
                    </div>;
                })}
            </div>;
        }
        return null;
    }
}

function toggleActors(scene, enabled) {
    if (scene) {
        each(scene.actors, (actor) => {
            if (actor.model && actor.model.boundingBoxDebugMesh) {
                actor.model.boundingBoxDebugMesh.visible = enabled;
            }
        });
    }
}

function toggleZones(scene, enabled) {
    if (scene) {
        each(scene.zones, (zone) => {
            zone.threeObject.visible = enabled;
            if (enabled) {
                zone.threeObject.updateMatrix();
            }
        });
    }
}

function togglePoints(scene, enabled) {
    if (scene) {
        each(scene.points, (point) => {
            point.threeObject.visible = enabled;
            if (enabled) {
                point.threeObject.updateMatrix();
            }
        });
    }
}
