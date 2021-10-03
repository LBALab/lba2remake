import * as THREE from 'three';

import React, { useEffect, useState, useRef } from 'react';

import SampleType from '../../game/data/sampleType';
import {
    GetInventoryMapping,
    GetInventoryRows,
    GetInventoryColumns,
    GetItemResourceIndex,
    MapItem,
    CanUseItem,
} from '../../game/data/inventory';
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
import { getParams } from '../../params';
import { heroUseItem } from '../../game/loop/hero';

const InventoryObjectsIndex = 4;
const InventoryTextOffset = 100;

const isLBA1 = getParams().game === 'lba1';

const Inventory = ({ game, closeInventory }: any) => {
    const [selectedSlot, setSelectedSlot] = useState(game.getState().hero.inventorySlot);
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

    const resolveItem = (slot: number) => {
        const rawItemId = GetInventoryMapping()[slot];
        const inventoryFlags = game.getState().flags.inventory;
        const state = inventoryFlags[rawItemId];
        const itemId = MapItem(rawItemId, state);
        return itemId;
    };

    const resolveItemResource = (slot: number) => {
        const itemId = resolveItem(slot);
        const resourceId = GetItemResourceIndex(itemId);
        return resourceId;
    };

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

    const loadModelForResource = async (slot: number, resource: number) => {
        models[slot] = {
            model: await loadSceneInventoryModel(invScenes[slot], resource),
            resourceId: resource,
        };
        setModels(models);
    };

    const loadModel = async (slot) => {
        // Models depend on the item state (e.g. blowgun vs blowtron).
        const resourceId = resolveItemResource(slot);
        await loadModelForResource(slot, resourceId);
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
        if (key === 'ArrowLeft' || controlsState?.left === 1) {
            if (selectedSlot % GetInventoryColumns() === 0) {
                newSlot = selectedSlot + GetInventoryColumns() - 1;
            } else {
                newSlot = selectedSlot - 1;
            }
            action = true;
        }
        if (key === 'ArrowRight' || controlsState?.right === 1) {
            if ((selectedSlot + 1) % GetInventoryColumns() === 0) {
                newSlot = selectedSlot - GetInventoryColumns() + 1;
            } else {
                newSlot = selectedSlot + 1;
            }
            action = true;
        }
        if (key === 'ArrowUp' || controlsState?.up === 1) {
            if (selectedSlot < GetInventoryColumns()) {
                newSlot = selectedSlot + GetInventoryColumns() * (GetInventoryRows() - 1);
            } else {
                newSlot = selectedSlot - GetInventoryColumns();
            }
            action = true;
        }
        if (key === 'ArrowDown' || controlsState?.down === 1) {
            if (selectedSlot >=
                GetInventoryColumns() * GetInventoryRows() - GetInventoryColumns()) {
                newSlot = selectedSlot - GetInventoryColumns() * (GetInventoryRows() - 1);
            } else {
                newSlot = selectedSlot + GetInventoryColumns();
            }
            action = true;
        }
        if (key === 'Enter' || controlsState?.action === 1) {
            // Use the raw (state-independent) item ID here as it may trigger script actions.
            const slot = game.getState().hero.inventorySlot;
            const rawItemId = GetInventoryMapping()[slot];
            const itemId = resolveItem(slot);
            if (game.getState().flags.quest[rawItemId] >= 1 && CanUseItem(itemId)) {
                heroUseItem(game, rawItemId, itemId);
                closeInventory();
            } else {
                game.getAudioManager().playSample(SampleType.ERROR);
            }
        }
        if (key === 'Escape' || controlsState?.shift === 1) {
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
        listener(event.code, null);
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
        const model = models[slot];
        const m = model?.model;

        if (!item || !item.current || !m) {
            return;
        }

        // If the item state has changed, request a reload and skip rendering.
        const resourceId = resolveItemResource(slot);
        if (model.resourceId !== resourceId) {
            models[slot] = null;
            loadModelForResource(slot, resourceId);
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
        // Text depends on item state (e.g. blowgun vs blowtron).
        const questFlags = game.getState().flags.quest;
        const rawItemId = GetInventoryMapping()[selectedSlot];
        const resourceId = resolveItemResource(selectedSlot);
        if (questFlags[rawItemId]) {
            getText(InventoryObjectsIndex).then((res) => {
                setInvText(res[InventoryTextOffset + resourceId].value);
            });
        } else {
            setInvText('');
        }
    }, [selectedSlot]);

    const inventorySlots = [];
    for (let i = 0; i < GetInventoryRows(); i += 1) {
        for (let j = 0; j < GetInventoryColumns(); j += 1) {
            const slot = i * GetInventoryColumns() + j;
            const value = game.getState().flags.quest[GetInventoryMapping()[slot]];
            const inInventory = value >= 1;
            const itemId = resolveItem(slot);
            const equipped = itemId === game.getState().hero.equippedItemId;
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
                    {value > 1 && (
                        <div className="inventoryValue">
                            {value}
                        </div>
                    )}
                </div>
            );
        }
    }

    return (
        <div className={`
            inventory
            ${isLBA1 === true ? 'inventoryLba1' : ''}
        `}>
            <div className={`
                    inventoryItems
                    ${isLBA1 === true ? 'inventoryItemsLba1' : ''}
                `}
                ref={inventoryRef}
            >
                {inventorySlots}
            </div>
            <div className={`
                inventoryText
                ${isLBA1 === true ? 'inventoryTextLba1' : ''}
            `}>
                <p>{invText}</p>
            </div>
        </div>
    );
};

export default Inventory;
