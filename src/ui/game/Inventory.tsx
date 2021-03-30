import * as THREE from 'three';

import React, { useEffect, useState, useRef } from 'react';

import { SampleType } from '../../game/data/sampleType';
import { GetInventoryMapping, GetInventoryRows, GetInventoryColumns, LBA2WeaponToBodyMapping } from '../../game/data/inventory';
import { getText } from '../../resources';
import '../styles/inventory.scss';
import {
    createOverlayScene,
    createOverlayClock,
    createOverlayCanvas,
    createOverlayRenderer,
    loadSceneInventoryModel,
} from './overlay';
import { ControlsState } from '../../game/ControlsState';

const InventoryObjectsIndex = 4;
const InventoryTextOffset = 100;

const Inventory = ({ game, closeInventory }: any) => {
    const [selectedSlot, setSelectedSlot] = useState(game.getState().hero.inventorySlot);
    const [equippedItem, setEquippedItem] = useState(game.getState().hero.equippedItemId);
    const [clock, setClock] = useState(null);
    const [canvas, setCanvas] = useState(null);
    const [renderer, setRenderer] = useState(null);
    const [invScenes, setInvScenes] = useState(null);
    const [models, setModels] = useState(null);
    const [invText, setInvText] = useState(null);

    const inventoryRef = useRef(null);
    const itemNodes = {};
    for (let i = 0; i < GetInventoryRows(); i += 1) {
        for (let j = 0; j < GetInventoryColumns(); j += 1) {
            const slot = i * GetInventoryColumns() + j;
            itemNodes[slot] = useRef(null);
        }
    }

    useEffect(() => {
        setClock(createOverlayClock());
        setCanvas(createOverlayCanvas('inventory-canvas'));
        setModels([]);

        const scenes = {};
        for (let i = 0; i < GetInventoryRows(); i += 1) {
            for (let j = 0; j < GetInventoryColumns(); j += 1) {
                const slot = i * GetInventoryColumns() + j;
                scenes[slot] = createOverlayScene(3);
            }
        }
        setInvScenes(scenes);
    }, []);

    useEffect(() => {
        if (canvas) {
            if (renderer === null) {
                setRenderer(createOverlayRenderer(canvas, 'inventory'));
            }
            inventoryRef.current.appendChild(canvas);
        }
    }, [canvas]);

    useEffect(() => {
        return () => {
            if (renderer) {
                renderer.dispose();
            }
        };
    }, [renderer]);

    const loadModel = async (slot) => {
        models[slot] = await loadSceneInventoryModel(invScenes[slot], GetInventoryMapping()[slot]);
        setModels(models);
    };

   useEffect(() => {
       if (clock) {
            clock.start();
            const questFlags = game.getState().flags.quest;
            for (let i = 0; i < GetInventoryRows(); i += 1) {
                for (let j = 0; j < GetInventoryColumns(); j += 1) {
                    const slot = i * GetInventoryColumns() + j;
                    if (questFlags[GetInventoryMapping()[slot]]) {
                        loadModel(slot);
                    }
                }
            }
        }
        return () => {
            if (clock) {
                clock.stop();
            }
        };
    }, [clock]);

    const listener = (key: string | number, controlsState: ControlsState) => {
        let action = false;
        let newSlot = -1;
        if (key === 37 || key === 'ArrowLeft' || controlsState?.left === 1) {
            if (selectedSlot % GetInventoryColumns() === 0) {
                newSlot = selectedSlot + GetInventoryColumns() - 1;
            } else {
                newSlot = selectedSlot - 1;
            }
            action = true;
        }
        if (key === 39 || key === 'ArrowRight' || controlsState?.right === 1) {
            if ((selectedSlot + 1) % GetInventoryColumns() === 0) {
                newSlot = selectedSlot - GetInventoryColumns() + 1;
            } else {
                newSlot = selectedSlot + 1;
            }
            action = true;
        }
        if (key === 38 || key === 'ArrowUp' || controlsState?.up === 1) {
            if (selectedSlot < GetInventoryColumns()) {
                newSlot = selectedSlot + GetInventoryColumns() * (GetInventoryRows() - 1);
            } else {
                newSlot = selectedSlot - GetInventoryColumns();
            }
            action = true;
        }
        if (key === 40 || key === 'ArrowDown' || controlsState?.down === 1) {
            if (selectedSlot >=
                GetInventoryColumns() * GetInventoryRows() - GetInventoryColumns()) {
                newSlot = selectedSlot - GetInventoryColumns() * (GetInventoryRows() - 1);
            } else {
                newSlot = selectedSlot + GetInventoryColumns();
            }
            action = true;
        }
        if (key === 13 || key === 'Enter' || controlsState?.action === 1) {
            const itemId = GetInventoryMapping()[game.getState().hero.inventorySlot];
            if (game.getState().flags.quest[itemId] === 1) {
                game.getState().hero.usingItemId = itemId;
                // Reset the usingItemId after a single game loop execution.
                game.addLoopFunction(null, () => {
                    game.getState().hero.usingItemId = -1;
                });
                if (itemId in LBA2WeaponToBodyMapping) {
                    setEquippedItem(itemId);
                    game.getState().hero.equippedItemId = itemId;
                }
                closeInventory();
            } else {
                game.getAudioManager().playSample(SampleType.ERROR);
            }
        }
        if (key === 27 || key === 'Escape' || controlsState?.shift === 1) {
            closeInventory();
        }
        if (action) {
            setSelectedSlot(newSlot);
            game.getState().hero.inventorySlot = newSlot;
        }
        event.preventDefault();
        event.stopPropagation();
    };

    const keyboardListener = (event) => {
        const key = event.code || event.which || event.keyCode;
        listener(key, null);
    };

    const gamepadListener = (event) => {
        listener(null, event.detail as ControlsState);
    };

    useEffect(() => {
        window.addEventListener('keydown', keyboardListener);
        window.addEventListener('lbagamepadchanged', gamepadListener);
        return () => {
            window.addEventListener('lbagamepadchanged', gamepadListener);
            window.removeEventListener('keydown', keyboardListener);
        };
    });

    const renderLoop = (time, slot, selected, item) => {
        const m = models[slot];

        if (!item || !item.current || !m) {
            return;
        }

        const s = invScenes[slot];

        const canvasClip = canvas.getBoundingClientRect();
        const { left, bottom, width, height } = item.current.getBoundingClientRect();

        // Set canvas size once with same aspect ratio as the inventory item box
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

        s.camera.update(m, selected, { x: 0, y: 0 }, 2.5, time);
        const h = m.boundingBox.max.y - m.boundingBox.min.y;
        s.camera.controlNode.position.add(new THREE.Vector3(0, h * -0.5, 0));
        renderer.render(s);
        renderer.stats.end();
    };

    useEffect(() => {
        if (renderer) {
            renderer.threeRenderer.setAnimationLoop(() => {
                const time = {
                    delta: Math.min(clock.getDelta(), 0.05),
                    elapsed: clock.getElapsedTime(),
                };
                const questFlags = game.getState().flags.quest;
                for (let i = 0; i < GetInventoryRows(); i += 1) {
                    for (let j = 0; j < GetInventoryColumns(); j += 1) {
                        const slot = i * GetInventoryColumns() + j;
                        if (questFlags[GetInventoryMapping()[slot]]) {
                            renderLoop(time, slot, selectedSlot === slot, itemNodes[slot]);
                        }
                    }
                }
            });
        }
        return () => {
            if (renderer) {
                renderer.threeRenderer.setAnimationLoop(null);
            }
        };
    }, [renderer, selectedSlot]);

    useEffect(() => {
        const questFlags = game.getState().flags.quest;
        const itemId = GetInventoryMapping()[selectedSlot];
        if (questFlags[itemId]) {
            getText(InventoryObjectsIndex).then((res) => {
                setInvText(res[InventoryTextOffset + itemId].value);
            });
        } else {
            setInvText('');
        }
    }, [selectedSlot]);

    const inventorySlots = [];
    for (let i = 0; i < GetInventoryRows(); i += 1) {
        for (let j = 0; j < GetInventoryColumns(); j += 1) {
            const slot = i * GetInventoryColumns() + j;
            const inInventory = game.getState().flags.quest[GetInventoryMapping()[slot]] === 1;
            const equipped = GetInventoryMapping()[slot] === equippedItem;
            inventorySlots.push(
                <div
                  ref={itemNodes[slot]}
                  key={slot}
                  className={`
                      inventoryItem ${selectedSlot === slot ? 'selected' : ''}
                      ${inInventory === true ? 'inInventory' : ''}
                      ${equipped === true ? 'equipped' : ''}
                  `}
                >
                </div>
            );
        }
    }

    return (
        <div className="inventory">
            <div className="inventoryItems" ref={inventoryRef}>
                {inventorySlots}
            </div>
            <div className="inventoryText"><p>{invText}</p></div>
        </div>
    );
};

export default Inventory;
