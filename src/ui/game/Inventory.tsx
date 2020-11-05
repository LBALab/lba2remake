import * as THREE from 'three';

import React, { useEffect, useState, useRef } from 'react';

import { SampleType } from '../../game/data/sampleType';
import { GetInventoryMapping, GetInventoryRows, GetInventoryColumns } from '../../game/data/inventory';
import '../styles/inventory.scss';
import {
    createOverlayScene,
    createOverlayClock,
    createOverlayCanvas,
    createOverlayRenderer,
    loadSceneInventoryModel,
} from './overlay';

// fixme: remove global vars
let clock = null;
let canvas = null;
let renderer = null;
const bScenes = [];
const model = [];

const initInventoryRenderer = async () => {
    for (let i = 0; i < GetInventoryRows(); i += 1) {
        for (let j = 0; j < GetInventoryColumns(); j += 1) {
            const slot = i * GetInventoryColumns() + j;
            bScenes[slot] = createOverlayScene(3);
        }
    }

    if (!clock) {
        clock = createOverlayClock();
    }

    if (!canvas) {
        canvas = createOverlayCanvas('inventory-canvas');
    }

    if (!renderer) {
        renderer = createOverlayRenderer(canvas, 'foundObject');
    }
};

initInventoryRenderer();


const renderLoop = (time, slot, selected, item) => {
    const m = model[slot];

    if (!item || !item.current || !m) {
        return;
    }

    const s = bScenes[slot];

    const canvasClip = canvas.getBoundingClientRect();
    const { left, bottom, width, height } = item.current.getBoundingClientRect();

    // set canvas size once with same aspect ratio as the behaviour item area
    if (canvas.width === 0) {
        canvas.width = canvas.style.width = width * 8;
        canvas.height = canvas.style.height = height * 8;
        renderer.resize(canvas.width, canvas.height);
    }

    const itemLeft = left - canvasClip.left;
    const itemBottom = canvasClip.bottom - bottom;

    renderer.stats.begin();

    renderer.setViewport(itemLeft, itemBottom, width, height);
    renderer.setScissor(itemLeft, itemBottom, width, height);
    renderer.setScissorTest(true);

    s.camera.update(
        m,
        selected,
        { x: 0, y: 0 },
        2.5,
        time,
    );
    //s.camera.controlNode.position.add(new THREE.Vector3(0, -2, 0));
    renderer.render(s);
    renderer.stats.end();
};


const Inventory = ({ game, closeInventory }: any) => {
    const [selectedSlot, setSelectedSlot] = useState(game.getState().hero.inventorySlot);

    const inventoryRef = useRef(null);
    const itemNodes = {};
    for (let i = 0; i < GetInventoryRows(); i += 1) {
        for (let j = 0; j < GetInventoryColumns(); j += 1) {
            const slot = i * GetInventoryColumns() + j;
            itemNodes[slot] = useRef(null);
        }
    }

    const listener = (event) => {
        const key = event.code || event.which || event.keyCode;
        let action = false;
        let newSlot = -1;
        switch (key) {
            case 37:
            case 'ArrowLeft':
                if (selectedSlot % GetInventoryColumns() === 0) {
                    newSlot = selectedSlot + GetInventoryColumns() - 1;
                } else {
                    newSlot = selectedSlot - 1;
                }
                action = true;
                break;
            case 39:
            case 'ArrowRight':
                if ((selectedSlot + 1) % GetInventoryColumns() === 0) {
                    newSlot = selectedSlot - GetInventoryColumns() + 1;
                } else {
                    newSlot = selectedSlot + 1;
                }
                action = true;
                break;
            case 38:
            case 'ArrowUp':
                if (selectedSlot < GetInventoryColumns()) {
                    newSlot = selectedSlot + GetInventoryColumns() * (GetInventoryRows() - 1);
                } else {
                    newSlot = selectedSlot - GetInventoryColumns();
                }
                action = true;
                break;
            case 40:
            case 'ArrowDown':
                if (selectedSlot >= GetInventoryColumns() * GetInventoryRows() - GetInventoryColumns()) {
                    newSlot = selectedSlot - GetInventoryColumns() * (GetInventoryRows() - 1);
                } else {
                    newSlot = selectedSlot + GetInventoryColumns();
                }
                action = true;
                break;
            case 13:
            case 'Enter':
                const itemId = GetInventoryMapping()[game.getState().hero.inventorySlot];
                if (game.getState().flags.quest[itemId] === 1) {
                    game.getState().hero.usingItemId = itemId;
                    // Reset the usingItemId after a single game loop execution.
                    game.addLoopFunction(null, () => {
                        game.getState().hero.usingItemId = -1;
                    });
                    closeInventory();
                } else {
                    game.getAudioManager().playSample(SampleType.ERROR);
                }
                break;
            case 27:
            case 'Escape':
                closeInventory();
                break;
        }
        if (action) {
            setSelectedSlot(newSlot);
            game.getState().hero.inventorySlot = newSlot;
        }
        event.preventDefault();
        event.stopPropagation();
    };

    useEffect(() => {
        window.addEventListener('keydown', listener);
        return () => {
            window.removeEventListener('keydown', listener);
        };
    });

    useEffect(() => {
        renderer.threeRenderer.setAnimationLoop(() => {
            const time = {
                delta: Math.min(clock.getDelta(), 0.05),
                elapsed: clock.getElapsedTime(),
            };

            for (let i = 0; i < GetInventoryRows(); i += 1) {
                for (let j = 0; j < GetInventoryColumns(); j += 1) {
                    const slot = i * GetInventoryColumns() + j;
                    const inInventory = game.getState().flags.quest[GetInventoryMapping()[slot]] === 1;
                    //if (inInventory) {
                        renderLoop(time, slot, selectedSlot === slot, itemNodes[slot]);
                   // }
                }
            }
        });
        return () => {
        };
    }, [selectedSlot]);

    const loadUpdateModel = async (slot) => {
        model[slot] = await loadSceneInventoryModel(bScenes[slot], GetInventoryMapping()[slot]);
    };

   useEffect(() => {
        clock.start();
        for (let i = 0; i < GetInventoryRows(); i += 1) {
            for (let j = 0; j < GetInventoryColumns(); j += 1) {
                const slot = i * GetInventoryColumns() + j;
                const inInventory = game.getState().flags.quest[GetInventoryMapping()[slot]] === 1;
                //if (inInventory) {
                    loadUpdateModel(slot);
               // }
            }
        }
        return () => {
            clock.stop();
            renderer.threeRenderer.setAnimationLoop(null);
        };
    }, []);

    useEffect(() => {
        inventoryRef.current.appendChild(canvas);
    }, []);


    const inventorySlots = [];
    for (let i = 0; i < GetInventoryRows(); i += 1) {
        for (let j = 0; j < GetInventoryColumns(); j += 1) {
            const slot = i * GetInventoryColumns() + j;
            const inInventory = game.getState().flags.quest[GetInventoryMapping()[slot]] === 1;
            inventorySlots.push(
                <div
                  ref={itemNodes[slot]}
                  key={slot}
                  className={`inventoryItem ${selectedSlot === slot ? 'selected' : ''} ${inInventory === true ? 'inInventory' : ''}`}>
                </div>
            );
        }
    }

    return (
        <div className="inventory">
            <div className="inventoryItems" ref={inventoryRef}>
                {inventorySlots}
            </div>
            <div className="inventoryText"></div>
        </div>
    );
};

export default Inventory;
