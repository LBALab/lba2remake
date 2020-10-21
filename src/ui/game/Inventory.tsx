import React, { useEffect, useState } from 'react';

import '../styles/inventory.scss';

const inventoryColumns = 7;
const inventoryRows = 5;

const Inventory = ({ game }: any) => {
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
                setSelectedSlot(newSlot);
                game.getState().hero.inventorySlot = newSlot;
                action = true;
                break;
            case 39:
            case 'ArrowRight':
                if ((selectedSlot + 1) % inventoryColumns === 0) {
                    newSlot = selectedSlot - inventoryColumns + 1;
                } else {
                    newSlot = selectedSlot + 1;
                }
                setSelectedSlot(newSlot);
                game.getState().hero.inventorySlot = newSlot;
                action = true;
                break;
            case 38:
            case 'ArrowUp':
                if (selectedSlot < inventoryColumns) {
                    newSlot = selectedSlot + inventoryColumns * (inventoryRows - 1);
                } else {
                    newSlot = selectedSlot - inventoryColumns;
                }
                setSelectedSlot(newSlot);
                game.getState().hero.inventorySlot = newSlot;
                action = true;
                break;
            case 40:
            case 'ArrowDown':
                if (selectedSlot > inventoryColumns * inventoryRows - inventoryColumns) {
                    newSlot = selectedSlot - inventoryColumns * (inventoryRows - 1);
                } else {
                    newSlot = selectedSlot + inventoryColumns;
                }
                setSelectedSlot(newSlot);
                game.getState().hero.inventorySlot = newSlot;
                action = true;
                break;
        }
        if (action) {
            event.preventDefault();
            event.stopPropagation();
        }
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
            inventorySlots.push(
                <div
                  key={String(slot)}
                  id={String(slot)}
                  className={`inventoryItem ${selectedSlot === slot ? 'selected' : ''}`}>
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
