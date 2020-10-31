import React, { useEffect, useState } from 'react';

import { SampleType } from '../../game/data/sampleType';
import { GetInventoryMapping, GetInventoryRows, GetInventoryColumns } from '../../game/data/inventory';
import '../styles/inventory.scss';

const inventoryColumns = 7;
const inventoryRows = 5;

const Inventory = ({ game, closeInventory }: any) => {
    const [selectedSlot, setSelectedSlot] = useState(game.getState().hero.inventorySlot);

    const listener = (event) => {
        const key = event.code || event.which || event.keyCode;
        let action = false;
        let newSlot = -1;
        switch (key) {
            case 37:
            case 'ArrowLeft':
                if (selectedSlot % inventoryColumns === 0) {
                    newSlot = selectedSlot + inventoryColumns - 1;
                } else {
                    newSlot = selectedSlot - 1;
                }
                action = true;
                break;
            case 39:
            case 'ArrowRight':
                if ((selectedSlot + 1) % inventoryColumns === 0) {
                    newSlot = selectedSlot - inventoryColumns + 1;
                } else {
                    newSlot = selectedSlot + 1;
                }
                action = true;
                break;
            case 38:
            case 'ArrowUp':
                if (selectedSlot < inventoryColumns) {
                    newSlot = selectedSlot + inventoryColumns * (inventoryRows - 1);
                } else {
                    newSlot = selectedSlot - inventoryColumns;
                }
                action = true;
                break;
            case 40:
            case 'ArrowDown':
                if (selectedSlot >= inventoryColumns * inventoryRows - inventoryColumns) {
                    newSlot = selectedSlot - inventoryColumns * (inventoryRows - 1);
                } else {
                    newSlot = selectedSlot + inventoryColumns;
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

    const inventorySlots = [];
    for (let i = 0; i < GetInventoryRows(); i += 1) {
        for (let j = 0; j < GetInventoryColumns(); j += 1) {
            const slot = i * GetInventoryColumns() + j;
            const inInventory = game.getState().flags.quest[GetInventoryMapping()[slot]] === 1;
            inventorySlots.push(
                <div
                  key={slot}
                  className={`inventoryItem ${selectedSlot === slot ? 'selected' : ''} ${inInventory === true ? 'inInventory' : ''}`}>
                </div>
            );
        }
    }

    return (
        <div className="inventory">
            <div className="inventoryItems">
                {inventorySlots}
            </div>
            <div className="inventoryText"></div>
        </div>
    );
};

export default Inventory;
