import React from 'react';

import '../styles/behaviour.scss';

interface IBehaviourMenuClover {
    boxes: number;
    leafs: number;
}

interface IBehaviourMenuProps {
    game: any;
}

interface IBehaviourMenu {
    behaviour: number;
    life: number;
    money: number;
    magic: number;
    keys: number;
    clover: IBehaviourMenuClover;
}

const BehaviourModeItem = (props: any) => (
    <div
        className={`behaviourItem${props.selected ? ' selected' : ''}`}
        {...props}
    >
    </div>
);

// @ts-ignore
const BehaviourMenu = ({ game }: IBehaviourMenuProps) => {
    const { behaviour, life, money, magic, keys, clover }: IBehaviourMenu = game.getState().hero;
    const behaviourText = (game.menuTexts)
        ? game.menuTexts[80 + behaviour].value : '';
    return (
        <div className="behaviourMenu">
            <div className="behaviourContainer">
                <div className="behaviourItemContainer">
                    <BehaviourModeItem selected={behaviour === 0} />
                    <BehaviourModeItem selected={behaviour === 1} />
                    <BehaviourModeItem selected={behaviour === 2} />
                    <BehaviourModeItem selected={behaviour === 3} style={{
                        marginRight: '0px'
                    }} />
                </div>
                <div className="behaviourMode">{behaviourText}</div>
            </div>
            <div className="behaviourContainer points">
                <div className="count money">{money}</div>
                <div className="count keys">{keys}</div>
                <div>{life}</div>
                <div>{magic}</div>
                <div>{clover.boxes}{clover.leafs}</div>
            </div>
        </div>
    );
};

export default BehaviourMenu;
