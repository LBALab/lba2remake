import React from 'react';

import '../styles/behaviour.scss';

interface IBehaviourMenuClover {
    boxes: number;
    leafs: number;
}

interface IBehaviourMenu {
    behaviour: number;
    life: number;
    money: number;
    magic: number;
    keys: number;
    clover: IBehaviourMenuClover;
}

// @ts-ignore
const BehaviourMenu = ({ behaviour, life, money, magic, keys, clover }: IBehaviourMenu) => {

    return (
        <div className="behaviourMenu">
            <div className="behaviourContainer">
                <div className="behaviourItemContainer">
                    <div className="behaviourItem"></div>
                    <div className="behaviourItem"></div>
                    <div className="behaviourItem"></div>
                    <div className="behaviourItem" style={{
                        marginRight: '0px'
                    }}></div>
                </div>
                <div className="behaviourMode">Normal</div>
            </div>
            <div className="behaviourContainer points">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default BehaviourMenu;
