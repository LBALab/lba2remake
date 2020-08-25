import React, { useEffect, useState } from 'react';

import '../styles/behaviour.scss';
import useMedia from '../hooks/useMedia';
import { BehaviourMode as BehaviourModeType } from '../../game/loop/hero';
import { MAX_LIFE } from '../../game/state';

interface IBehaviourMenuClover {
    boxes: number;
    leafs: number;
}

interface IBehaviourMenuMagicBall {
    level: number;
    strength: number;
    bounce: number;
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
    magicball: IBehaviourMenuMagicBall;
}

const BehaviourModeItem = (props: any) => (
    <div
        className={`behaviourItem${props.selected ? ' selected' : ''}`}
        {...props}
    >
    </div>
);

const BehaviourMode = ({ game, behaviour }) => {
    const behaviourText = (game.menuTexts)
    ? game.menuTexts[80 + behaviour].value : '';
    return (
        <div className="behaviourMode">{behaviourText}</div>
    );
};

const BehaviourCount = ({ type, value }: { type: 'keys' | 'money', value: number}) => {
    // TODO zlitos
    const imgType = type === 'keys' ? 'keys' : 'kashes';
    return (
        <div className={`count ${type}`}>
            <img src={`images/${imgType}.png`} />
            <div>{value}</div>
        </div>
    );
};

const BehavourPointProgress = ({ type, value, maxValue, size }
    : { type: 'magic' | 'life', value: number, maxValue: number, size?: number }) => {
        let maxWidth = useMedia(
            ['(max-width: 768px)', '(max-width: 1024px)'],
            [200, 400],
            470,
        );
        if (type === 'magic') {
            maxWidth = Math.floor(maxWidth / (4 - size));
        }
        const width = (value * maxWidth) / maxValue;
    return (
        maxValue > 0 ?
            <div className={`pointsProgressContainer ${type}`}>
                <img src={`images/${type}.png`} />
                <div className="pointsProgress" style={{
                        width: maxWidth,
                    }}
                >
                    <div className={`progress ${type}`} style={{
                        borderTopRightRadius: value === maxValue ? 15 : 0,
                        borderBottomRightRadius: value === maxValue ? 15 : 0,
                        width,
                    }}>
                    </div>
                </div>
            </div>
        : null
    );
};

const BehaviourClovers = ({ boxes, leafs}: IBehaviourMenuClover) => {
    const clovers = [];
    for (let b = 0; b < boxes; b += 1) {
        if (leafs > b) {
            clovers.push('cloverboxleaf');
        } else {
            clovers.push('cloverbox');
        }
    }
    return (
        <div className="clovers">
            {clovers.map(type => (
                <img
                    key={type}
                    src={`images/${type}.png`}
                />
            ))}
        </div>
    );
};

// @ts-ignore
const BehaviourMenu = ({ game }: IBehaviourMenuProps) => {
    const {
        life,
        money,
        magic,
        keys,
        clover,
        magicball
    }: IBehaviourMenu = game.getState().hero;

    const [behaviour, setBehaviour] = useState(game.getState().hero.behaviour);

    const listener = (event) => {
        let behav = behaviour;
        let action = false;
        const key = event.code || event.which || event.keyCode;
        switch (key) {
            case 37:
            case 'ArrowLeft':
                action = true;
                switch (true) {
                    // Normal 4 behaviour modes.
                    case behav <= BehaviourModeType.DISCRETE:
                        behav -= 1;
                        if (behav < BehaviourModeType.NORMAL) {
                            behav = BehaviourModeType.DISCRETE;
                        }
                        break;
                    case behav === BehaviourModeType.PROTOPACK:
                        behav = BehaviourModeType.JETPACK;
                        break;
                    case behav === BehaviourModeType.JETPACK:
                        behav = BehaviourModeType.PROTOPACK;
                        break;
                }
                break;
            case 39:
            case 'ArrowRight':
                action = true;
                switch (true) {
                    // Normal 4 behaviour modes.
                    case behav <= BehaviourModeType.DISCRETE:
                        behav += 1;
                        if (behav > BehaviourModeType.DISCRETE) {
                            behav = BehaviourModeType.NORMAL;
                        }
                        break;
                    case behav === BehaviourModeType.PROTOPACK:
                        behav = BehaviourModeType.JETPACK;
                        break;
                    case behav === BehaviourModeType.JETPACK:
                        behav = BehaviourModeType.PROTOPACK;
                        break;
                }
                break;
            case 38:
            case 'ArrowUp':
                action = true;
                switch (true) {
                    // Normal 4 behaviour modes.
                    case behav <= BehaviourModeType.DISCRETE:
                        behav = BehaviourModeType.HORN;
                        break;
                    case behav === BehaviourModeType.HORN:
                        behav = BehaviourModeType.PROTOPACK;
                        break;
                    case behav === BehaviourModeType.PROTOPACK ||
                         behav === BehaviourModeType.JETPACK:
                        behav = BehaviourModeType.NORMAL;
                        break;
                }
                break;
            case 40:
            case 'ArrowDown':
                action = true;
                switch (true) {
                    // Normal 4 behaviour modes.
                    case behav <= BehaviourModeType.DISCRETE:
                        behav = BehaviourModeType.PROTOPACK;
                        break;
                    case behav === BehaviourModeType.PROTOPACK ||
                         behav === BehaviourModeType.JETPACK:
                        behav = BehaviourModeType.HORN;
                        break;
                    case behav === BehaviourModeType.HORN:
                        behav = BehaviourModeType.NORMAL;
                        break;
                }
                break;
        }
        if (action) {
            event.preventDefault();
            event.stopPropagation();
        }

        setBehaviour(behav);
        game.getState().hero.behaviour = behav;
    };

    useEffect(() => {
        window.addEventListener('keydown', listener);
        return () => {
            window.removeEventListener('keydown', listener);
        };
    });

    let behaviourModeItems;
    if (behaviour <= BehaviourModeType.DISCRETE) {
        behaviourModeItems = (
            <div className="behaviourItemContainer">
                <BehaviourModeItem selected={behaviour === 0} />
                <BehaviourModeItem selected={behaviour === 1} />
                <BehaviourModeItem selected={behaviour === 2} />
                <BehaviourModeItem selected={behaviour === 3} style={{
                    marginRight: '0px'
                }} />
            </div>
        );
    } else if (behaviour === BehaviourModeType.HORN) {
        behaviourModeItems = (
            <div className="behaviourItemContainer">
                <BehaviourModeItem selected={behaviour === 6} />
            </div>
        );
    } else if (behaviour === BehaviourModeType.PROTOPACK ||
               behaviour === BehaviourModeType.JETPACK) {
        behaviourModeItems = (
            <div className="behaviourItemContainer">
                <BehaviourModeItem selected={behaviour === 4} />
                <BehaviourModeItem selected={behaviour === 8} />
            </div>
        );
    }

    return (
        <div className="behaviourMenu">
            <div className="behaviourContainer">
                {behaviourModeItems}
                <BehaviourMode game={game} behaviour={behaviour} />
            </div>
            <div className="behaviourContainer points">
                <BehaviourCount type="money" value={money} />
                <BehaviourCount type="keys" value={keys} />
                <BehavourPointProgress
                    type="life"
                    value={life}
                    maxValue={MAX_LIFE}
                />
                <BehavourPointProgress
                    type="magic"
                    value={magic}
                    maxValue={magicball.level * 20}
                    size={magicball.level}
                />
                <BehaviourClovers boxes={clover.boxes} leafs={clover.leafs} />
            </div>
        </div>
    );
};

export default BehaviourMenu;
