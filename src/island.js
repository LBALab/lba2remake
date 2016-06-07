import THREE from 'three';
import async from 'async';
import _ from 'lodash';
import HQR from './hqr';

export default function(name, callback) {
    async.auto({
        hqr_ress: load_hqr.bind(null, 'data/RESS.HQR'),
        hqr_island: load_hqr.bind(null, `data/${name}.ILE`),
        palette: ['hqr_ress', palette],
        layout: ['hqr_island', load_layout],
        ground_texture: ['palette', 'hqr_island', load_texture.bind(null, 'hqr_island', 1)],
        ground: ['layout', load_ground]
    }, function(err, data) {
        const geometry = new THREE.PlaneGeometry(10, 10);
        const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: data.ground_texture
        });
        var plane = new THREE.Mesh(geometry, material);
        console.log(data.layout);
        callback(plane);
    });
}

function load_hqr(file, callback) {
    new HQR().load(file, function() {
        callback.call(null, null, this);
    });
}

function palette(data, callback) {
    callback(null, new Uint8Array(data.hqr_ress.getEntry(0)));
}

function load_texture(hqr_prop, idx, data, callback) {
    const pixel_data = new Uint8Array(data[hqr_prop].getEntry(idx));
    const image_data = new Uint8Array(256 * 256 * 4);
    for (let i = 0; i < 65536; ++i) { // 256 * 256
        image_data[i * 4] = data.palette[pixel_data[i] * 3];
        image_data[i * 4 + 1] = data.palette[pixel_data[i] * 3 + 1];
        image_data[i * 4 + 2] = data.palette[pixel_data[i] * 3 + 2];
        image_data[i * 4 + 3] = 0xFF;
    }
    const texture = new THREE.DataTexture(image_data, 256, 256);
    texture.needsUpdate = true;
    callback(null, texture);
}

function load_layout(data, callback) {
    const layout_raw = new Uint8Array(data.hqr_island.getEntry(0));
    const layout = [];
    for (let i = 0; i < 256; ++i) {
        const x = Math.floor(i / 16);
        const y = i % 16;
        if (layout_raw[i]) {
            layout.push({
                id: layout_raw[i],
                x: x - 8,
                y: y - 8
            })
        }
    }
    callback(null, layout);
}

class Heightmap {
    constructor(buffer) {
        this._heights = new Uint16Array(buffer)
    }

    getHeights(x, y) {
        const ax = x + 32;
        const ay = y + 32;
        return [
            [this._heights[ax * 64 + ay], this._heights[ax * 64 + ay + 1]],
            [this._heights[(ax + 1) * 64 + ay], this._heights[(ax + 1) * 64 + ay + 1]],
        ];
    }
}

function load_ground(data, callback) {
    _.each(data.layout, section => {
        section.heightmap = new Heightmap(data.hqr_island.getEntry(section.id * 6 + 1))
    });
    callback();
}
