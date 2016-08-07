import THREE from 'three';
import _ from 'lodash';

const push = Array.prototype.push;

/** Load LBA model body */
export function loadBodyGeometry(geometry, object, palette) {
    loadFaceGeometry(geometry, object, palette);
    loadSphereGeometry(geometry, object, palette);
    loadLineGeometry(geometry, object, palette);
}

function loadFaceGeometry(geometry, object, palette) {
    _.each(object.polygons, (p) => {
        const addVertex = (j) => {
            const vertexIndex = p.vertex[j];
    	    push.apply(geometry.positions, getPosition(object, vertexIndex));
            push.apply(geometry.colors, getColour(p.colour, palette, p.hasTransparency, p.hasTex));
            push.apply(geometry.uvs, getUVs(object, p, j));
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

function loadSphereGeometry(geometry, object, palette) {
    _.each(object.spheres, (s) => {
        const centerPos = getPosition(object, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(s.size, 8, 8);
        
        const addVertex = (j) => {
    	    push.apply(geometry.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
            push.apply(geometry.colors, getColour(s.colour, palette, false, false));
            push.apply(geometry.uvs, [0,0]);
        };

        _.each(sphereGeometry.faces, (f) => {
            addVertex(f.a);
            addVertex(f.b);
            addVertex(f.c);
        });
    });
}

function loadLineGeometry(geometry, object, palette) {
    _.each(object.lines, (l) => {
        const addVertex = (p,c) => {
            push.apply(geometry.linePositions, p);
            push.apply(geometry.lineColors, getColour(c, palette, false, false));
        };
        let v1 = getPosition(object, l.vertex1);
        let v2 = getPosition(object, l.vertex2);

        addVertex(v1,l.colour);
        addVertex(v2,l.colour);
    });
}

function getPosition(object, index) {
    const vertex = object.vertices[index];
    let boneIdx = vertex.bone;

    let pos = {
        x: vertex.x,
        y: vertex.y,
        z: vertex.z
    };

    while(true) {
        const bone = object.bones[boneIdx];
        const boneVertex = object.vertices[bone.vertex];
        
        pos.x += boneVertex.x;
        pos.y += boneVertex.y;
        pos.z += boneVertex.z;

        if(bone.parent == 0xFFFF)
            break;
            
        boneIdx = bone.parent;
    }
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
