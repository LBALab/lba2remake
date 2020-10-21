import React, { useEffect, useState } from 'react';

import { SampleType } from '../../game/data/sampleType';
import '../styles/inventory.scss';

const inventoryColumns = 7;
const inventoryRows = 5;

// inventoryMapping maps from inventory slot ID to item ID.
// Note that slots are defined as starting from 0 in the top left and increasing
// to the right row by row.
const inventoryMapping = {
    0: 1,   // Magic ball
    1: 2,   // Darts
    2: 23,  // SARBACANE
    3: 22,  // Horn
    4: 11,  // Wanny glove
    5: 9,   // Laser pistol
    6: 10,  // Sword
    7: 4,   // Tunic
    8: 3,   // Sendell's ball
    9: 19,  // Lightning spell
    10: 39, // Protection spell
    11: 28, // Magic slate
    12: 30, // Wizards diploma
    13: 31, // DMKEY_KNARTA
    14: 0,  // Holomap
    15: 12, // Protopack
    16: 26, // Radio
    17: 29, // Translator
    18: 14, // Meca penguin
    19: 8,  // Money
    20: 32, // DMKEY_SUP
    21: 18, // Ferry man song
    22: 25, // Firefly tart
    23: 35, // Key to island CX
    24: 21, // Gems
    25: 5,  // Pearl of incandescence
    26: 36, // Pickaxe
    27: 33, // DMKEY_MOSQUI
    28: 15, // Gazogem
    29: 16, // Medallion
    30: 20, // Umbrella
    31: 24, // Red Viewer
    32: 13, // Ferry ticket
    33: 38, // Franco note
    34: 34, // DMKEY_BLAFARD
};

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
                const itemId = inventoryMapping[game.getState().hero.inventorySlot];
                if (game.getState().flags.quest[itemId] === 1) {
                    game.getState().hero.usingItemId = itemId;
                    closeInventory();
                } else {
                    game.getAudioManager().playSample(SampleType.ERROR);
                }
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
    for (let i = 0; i < inventoryRows; i += 1) {
        for (let j = 0; j < inventoryColumns; j += 1) {
            const slot = i * inventoryColumns + j;
            const inInventory = game.getState().flags.quest[inventoryMapping[slot]] === 1;
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
