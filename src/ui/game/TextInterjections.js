import React from 'react';
import {extend, map} from 'lodash';
import * as THREE from 'three';

const baseStyle = {
    position: 'absolute',
    fontFamily: 'LBA',
    textShadow: 'black 4px 4px',
    fontSize: '2.5em',
    transform: 'translate(-50%, -50%)'
};

const POS = new THREE.Vector3();

export default function TextInterjections(props) {
    return <div>
        {map(props.interjections, (itrj, id) => {
            if (props.scene.index !== itrj.scene) {
                return null;
            }
            const renderer = props.renderer;
            const actor = props.scene.actors[itrj.actor];
            const widthHalf = 0.5 * renderer.canvas.clientWidth;
            const heightHalf = 0.5 * renderer.canvas.clientHeight;

            actor.threeObject.updateMatrixWorld();
            POS.setFromMatrixPosition(actor.threeObject.matrixWorld);
            POS.y += 0.1;
            POS.project(renderer.getMainCamera(props.scene));
            POS.x = (POS.x * widthHalf) + widthHalf;
            POS.y = -(POS.y * heightHalf) + heightHalf;
            if (POS.z < 1) {
                const style = extend({
                    color: itrj.color,
                    left: POS.x,
                    top: POS.y
                }, baseStyle);
                return <div key={id} style={style}>{itrj.value}</div>;
            }
            return null;
        })}
    </div>;
}
