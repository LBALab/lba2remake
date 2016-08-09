import THREE from 'three';
import _ from 'lodash';

const push = Array.prototype.push;

/** Load LBA model body */
export function loadBodyGeometry(geometry, object, skeleton, palette) {
    loadFaceGeometry(geometry, object, skeleton, palette);
    loadSphereGeometry(geometry, object, skeleton, palette);
    loadLineGeometry(geometry, object, skeleton, palette);

    debugBoneGeometry(geometry, object, skeleton, palette);
}

function loadFaceGeometry(geometry, object, skeleton, palette) {
    _.each(object.polygons, (p) => {
        const addVertex = (j) => {
            const vertexIndex = p.vertex[j];
    	    push.apply(geometry.positions, getPosition(object, skeleton, vertexIndex));
            push.apply(geometry.colors, getColour(p.colour, palette, p.hasTransparency, p.hasTex));
            push.apply(geometry.uvs, getUVs(object, p, j));
            push.apply(geometry.bones, getBone(object, vertexIndex));
        };    
        for (let j = 0; j < 3; ++j) {
            addVertex(j);
        } 
        if (p.numVertex == 4) { // quad
            for (let j of [0, 2, 3]) {
                addVertex(j);
            }
        }
    });
}

function loadSphereGeometry(geometry, object, skeleton, palette) {
    _.each(object.spheres, (s) => {
        const centerPos = getPosition(object, skeleton, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(s.size, 8, 8);
        
        const addVertex = (j) => {
    	    push.apply(geometry.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
            push.apply(geometry.colors, getColour(s.colour, palette, false, false));
            push.apply(geometry.uvs, [0,0]);
            push.apply(geometry.bones, getBone(object, s.vertex));
        };

        _.each(sphereGeometry.faces, (f) => {
            addVertex(f.a);
            addVertex(f.b);
            addVertex(f.c);
        });
    });
}

function loadLineGeometry(geometry, object, skeleton, palette) {
    _.each(object.lines, (l) => {
        const addVertex = (p,c,i) => {
            push.apply(geometry.linePositions, p);
            push.apply(geometry.lineColors, getColour(c, palette, false, false));
            push.apply(geometry.lineBones, getBone(object, i));
        };
        let v1 = getPosition(object, skeleton, l.vertex1);
        let v2 = getPosition(object, skeleton, l.vertex2);

        addVertex(v1,l.colour, l.vertex1);
        addVertex(v2,l.colour, l.vertex2);
    });
}

function debugBoneGeometry(geometry, object, skeleton, palette) {
    _.each(object.bones, (s) => {
        const centerPos = getPosition(object, skeleton, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(0.001, 8, 8);
        
        const addVertex = (j) => {
    	    push.apply(geometry.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
            push.apply(geometry.colors, (s.parent == 0xFFFF) ? [0,0,255,255] : [255,0,0,255]);
            push.apply(geometry.uvs, [0,0]);
            push.apply(geometry.bones, getBone(object, s.vertex));
        };

        _.each(sphereGeometry.faces, (f) => {
            addVertex(f.a);
            addVertex(f.b);
            addVertex(f.c);
        });
    });
}

function getBone(object, index) {
    const vertex = object.vertices[index];
    return [ vertex.bone ];
}

function getPosition(object, skeleton, index) {
    const vertex = object.vertices[index];
    let boneIdx = vertex.bone;

    let pos = {
        x: vertex.x,
        y: vertex.y,
        z: vertex.z
    };

    /*while(true) {
        const bone = skeleton[boneIdx];

        pos.x += bone.pos.x;
        pos.y += bone.pos.y;
        pos.z += bone.pos.z;

        if(bone.parent == 0xFFFF)
            break;
            
        boneIdx = bone.parent;
    }*/
    return [
        pos.x,
        pos.y,
        pos.z
    ];
}

function getColour(colour, palette, hasTransparency, hasTex) {
    return [
        palette[colour * 3], 
        palette[colour * 3 + 1],
        palette[colour * 3 + 2],
        hasTex ? 0 : hasTransparency ? 127 : 255 
    ];
}

function getUVs(object, p, vertex) {
    if (p.hasTex) {
        const t = object.uvGroups[p.tex];
        const x = p.texX[vertex] + p.unkX[vertex]/256;
        const y = p.texY[vertex] + p.unkY[vertex]/256;
        return [(x & t.width) + t.x, (y & t.height) + t.y];
    }
    return [0, 0];
}
