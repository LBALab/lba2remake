/**
 * @author alteredq / http://alteredqualia.com/
 */

import * as THREE from 'three';
import Pass from './Pass';

export default function RenderPass(scene, camera, overrideMaterial, clearColor, clearAlpha) {
    Pass.call(this);

    this.scene = scene;
    this.camera = camera;

    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = (clearAlpha !== undefined) ? clearAlpha : 1;

    this.oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;

    this.clear = true;
    this.needsSwap = false;
}

RenderPass.prototype = Object.create(Pass.prototype);

RenderPass.prototype = {

    constructor: RenderPass,

    render(renderer, writeBuffer, readBuffer) {
        this.scene.overrideMaterial = this.overrideMaterial;

        if (this.clearColor) {
            this.oldClearColor.copy(renderer.getClearColor());
            this.oldClearAlpha = renderer.getClearAlpha();

            renderer.setClearColor(this.clearColor, this.clearAlpha);
        }

        renderer.render(this.scene, this.camera, readBuffer, this.clear);

        if (this.clearColor) {
            renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
        }

        this.scene.overrideMaterial = null;
    }

};
