import React, { useEffect, useState, useRef, Component } from 'react';

import '../styles/behaviour.scss';
import useMedia from '../hooks/useMedia';
import { BehaviourMode as BehaviourModeType } from '../../game/loop/hero';
import { MAX_LIFE } from '../../game/GameState';

import { loadAnimState } from '../../model/animState';
import {
    createOverlayScene,
    createOverlayClock,
    createOverlayCanvas,
    createOverlayRenderer,
    updateAnimModel,
    loadSceneModel,
} from './overlay';
import Game from '../../game/Game';
import Scene from '../../game/Scene';
import { getParams } from '../../params';
import { LBA2Items, LBA1Items } from '../../game/data/inventory';

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
    game: Game;
    scene: Scene;
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

interface IBehaviourItem {
    behaviour: number;
    selected: boolean;
    behaviourChanged: number;
    divRef?: any;
    style?: any;
}

// fixme: remove global vars
let clock = null;
let canvas = null;
let renderer = null;
const bScenes = [];
const model = [];
const animState = [];

const initBehaviourRenderer = async () => {
    bScenes.push(createOverlayScene());
    bScenes.push(createOverlayScene());
    bScenes.push(createOverlayScene());
    bScenes.push(createOverlayScene());
    bScenes.push(createOverlayScene());
    bScenes.push(createOverlayScene());
    bScenes.push(createOverlayScene());
    bScenes.push({}); // 7
    bScenes.push(createOverlayScene());

    if (!clock) {
        clock = createOverlayClock();
    }

    if (!canvas) {
        canvas = createOverlayCanvas('behaviour-canvas');
    }

    if (!renderer) {
        renderer = createOverlayRenderer(canvas, 'behaviour-menu');
    }
};

initBehaviourRenderer();

const renderLoop = (time, behaviour, selected, item) => {
    const m = model[behaviour];

    if (!item || !item.current || !m) {
        return;
    }

    const anims = animState[behaviour];
    const s = bScenes[behaviour];

    const canvasClip = canvas.getBoundingClientRect();
    const { left, bottom, width, height } = item.current.getBoundingClientRect();

    // set canvas size once with same aspect ratio as the behaviour item area
    if (canvas.width === 0) {
        canvas.width = canvas.style.width = width * 5;
        canvas.height = canvas.style.height = height * 5;
        renderer.resize(canvas.width, canvas.height);
    }

    const itemLeft = left - canvasClip.left;
    const itemBottom = canvasClip.bottom - bottom - 10;

    if (selected) {
        updateAnimModel(m, anims, behaviour, 0, time);
    }
    renderer.stats.begin();

    renderer.setViewport(itemLeft, itemBottom, width, height);
    renderer.setScissor(itemLeft, itemBottom, width, height);
    renderer.setScissorTest(true);

    s.camera.update(m, selected, {x: 0, y: 0}, -0.9, time);
    renderer.render(s);

    renderer.stats.end();
};

class BehaviourModeItem extends Component<IBehaviourItem> {
    constructor(props) {
        super(props);
    }

    render() {
        const { selected, behaviour, divRef, behaviourChanged, ...rest } = this.props;
        return (
            <div
                ref={divRef}
                className={`behaviourItem ${behaviour} ${selected ? 'selected' : ''}`}
                {...rest}
            >
            </div>
        );
    }
}

const BehaviourMode = ({ game, behaviour }) => {
    const isLBA1 = getParams().game === 'lba1';
    let textIndex = behaviour + (isLBA1 ? 0 : 80);
    if (isLBA1 && behaviour === BehaviourModeType.PROTOPACK) {
        textIndex += 1;
    }
    const behaviourText = (game.menuTexts)
    ? game.menuTexts[textIndex].value : '';
    return (
        <div className="behaviourMode">{behaviourText}</div>
    );
};

const BehaviourCount = ({ type, value }: { type: 'keys' | 'money', value: number}) => {
    // TODO zlitos
    const imgType = type === 'keys' ? 'keys' : 'kashes';
    return (
        <div className={`count ${type}`}>
            <img src={`images/${imgType}.svg`} />
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
                <img src={`images/${type}.svg`} />
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
                    src={`images/${type}.svg`}
                />
            ))}
        </div>
    );
};

const BehaviourMenu = ({ game, scene }: IBehaviourMenuProps) => {
    const {
        life,
        money,
        magic,
        keys,
        clover,
        magicball,
    }: IBehaviourMenu = game.getState().hero;
    const [behaviour, setBehaviour] = useState(game.getState().hero.behaviour);
    const behaviourModeRef = useRef(null);
    const itemNodes = {
        0: useRef(null),
        1: useRef(null),
        2: useRef(null),
        3: useRef(null),
        4: useRef(null),
        5: useRef(null),
        6: useRef(null),
        8: useRef(null),
    };
    const isLBA1 = getParams().game === 'lba1';

    const hasProtoPack = game.getState().flags.quest[LBA2Items.PROTO_PACK] ||
        game.getState().flags.quest[LBA1Items.PROTO_PACK];
    const hasJetpack = game.getState().flags.quest[LBA2Items.PROTO_PACK] === 2;
    const hasHorn = game.getState().flags.quest[LBA2Items.HORN];

    const listener = (event) => {
        let behav = behaviour;
        let action = false;
        const key = event.code || event.which || event.keyCode;
        switch (key) {
            case 37:
            case 'ArrowLeft':
                action = true;
                if (behav <= BehaviourModeType.DISCRETE) {
                    behav -= 1;
                    if (behav < BehaviourModeType.NORMAL) {
                        behav = BehaviourModeType.DISCRETE;
                    }
                } else if (!isLBA1 && hasJetpack && behav === BehaviourModeType.PROTOPACK) {
                    behav = BehaviourModeType.JETPACK;
                } else if (!isLBA1 && hasProtoPack && behav === BehaviourModeType.JETPACK) {
                    behav = BehaviourModeType.PROTOPACK;
                }
                break;
            case 39:
            case 'ArrowRight':
                action = true;
                if (behav <= BehaviourModeType.DISCRETE) {
                    behav += 1;
                    if (behav > BehaviourModeType.DISCRETE) {
                        behav = BehaviourModeType.NORMAL;
                    }
                } else if (!isLBA1 && hasJetpack && behav === BehaviourModeType.PROTOPACK) {
                    behav = BehaviourModeType.JETPACK;
                } else if (!isLBA1 && hasProtoPack && behav === BehaviourModeType.JETPACK) {
                    behav = BehaviourModeType.PROTOPACK;
                }
                break;
            case 38:
            case 'ArrowUp':
                action = true;
                if (behav <= BehaviourModeType.DISCRETE) {
                    if (isLBA1 && hasProtoPack) {
                        behav = BehaviourModeType.PROTOPACK;
                    } else if (hasHorn) {
                        behav = BehaviourModeType.HORN;
                    }
                } else if (!isLBA1 && hasProtoPack && behav === BehaviourModeType.HORN) {
                    behav = BehaviourModeType.PROTOPACK;
                } else if (behav === BehaviourModeType.PROTOPACK ||
                         behav === BehaviourModeType.JETPACK) {
                    behav = BehaviourModeType.NORMAL;
                }
                break;
            case 40:
            case 'ArrowDown':
                action = true;
                if (hasProtoPack && behav <= BehaviourModeType.DISCRETE) {
                    behav = BehaviourModeType.PROTOPACK;
                } else if (behav === BehaviourModeType.PROTOPACK ||
                         behav === BehaviourModeType.JETPACK) {
                    if (isLBA1) {
                        behav = BehaviourModeType.NORMAL;
                    } else if (hasHorn) {
                        behav = BehaviourModeType.HORN;
                    }
                } else if (!isLBA1 && behav === BehaviourModeType.HORN) {
                    behav = BehaviourModeType.NORMAL;
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

    useEffect(() => {
        renderer.threeRenderer.setAnimationLoop(() => {
            const time = {
                delta: Math.min(clock.getDelta(), 0.05),
                elapsed: clock.getElapsedTime(),
            };
            if (behaviour <= BehaviourModeType.DISCRETE) {
                renderLoop(time, 0, behaviour === 0, itemNodes[0]);
                renderLoop(time, 1, behaviour === 1, itemNodes[1]);
                renderLoop(time, 2, behaviour === 2, itemNodes[2]);
                renderLoop(time, 3, behaviour === 3, itemNodes[3]);
            } else if (behaviour === BehaviourModeType.HORN) {
                renderLoop(time, 6, behaviour === 6, itemNodes[6]);
            } else if (behaviour === BehaviourModeType.PROTOPACK ||
                behaviour === BehaviourModeType.JETPACK) {
                renderLoop(time, 4, behaviour === 4, itemNodes[4]);
                if (!isLBA1) {
                    renderLoop(time, 8, behaviour === 8, itemNodes[8]);
                }
            } else if (behaviour === BehaviourModeType.ZOE) {
                renderLoop(time, 5, behaviour === 5, itemNodes[5]);
            }
        });
        return () => {
        };
    }, [behaviour]);

    const loadUpdateModel = async (b) => {
        // reset camera angle based on hero angle in the scene
        const heroAngle = scene.actors[0].physics.temp.angle;
        bScenes[b].camera.setAngle(heroAngle + Math.PI - (Math.PI / 4));
        const bodyIndex = scene.actors[0].props.bodyIndex;
        // load models
        if (!animState[b]) {
            animState[b] = loadAnimState();
        }
        model[b] = await loadSceneModel(bScenes[b], b, bodyIndex, animState[b]);
        updateAnimModel(model[b], animState[b], b, 0, {delta: 0, elapsed: 0});
    };

    useEffect(() => {
        clock.start();
        loadUpdateModel(0);
        loadUpdateModel(1);
        loadUpdateModel(2);
        loadUpdateModel(3);
        loadUpdateModel(4);
        loadUpdateModel(5);
        loadUpdateModel(6);
        loadUpdateModel(8);
        return () => {
            clock.stop();
            renderer.threeRenderer.setAnimationLoop(null);
        };
    }, []);

    useEffect(() => {
        behaviourModeRef.current.appendChild(canvas);
    }, []);

    let behaviourModeItems;
    if (behaviour <= BehaviourModeType.DISCRETE) {
        behaviourModeItems = (
            <>
                <BehaviourModeItem
                    divRef={itemNodes[0]}
                    behaviour={0}
                    behaviourChanged={behaviour}
                    selected={behaviour === 0}
                />
                <BehaviourModeItem
                    divRef={itemNodes[1]}
                    behaviour={1}
                    behaviourChanged={behaviour}
                    selected={behaviour === 1}
                />
                <BehaviourModeItem
                    divRef={itemNodes[2]}
                    behaviour={2}
                    behaviourChanged={behaviour}
                    selected={behaviour === 2}
                />
                <BehaviourModeItem
                    divRef={itemNodes[3]}
                    behaviour={3}
                    behaviourChanged={behaviour}
                    selected={behaviour === 3}
                    style={{
                    marginRight: '0px'
                }} />
            </>
        );
    } else if (!isLBA1 && behaviour === BehaviourModeType.HORN) {
        behaviourModeItems = (
            <>
                <BehaviourModeItem
                    divRef={itemNodes[6]}
                    behaviour={6}
                    behaviourChanged={behaviour}
                    selected={behaviour === 6}
                />
            </>
        );
    } else if (behaviour === BehaviourModeType.PROTOPACK ||
               behaviour === BehaviourModeType.JETPACK) {
        behaviourModeItems = (
            <>
                <BehaviourModeItem
                    divRef={itemNodes[4]}
                    behaviour={4}
                    behaviourChanged={behaviour}
                    selected={behaviour === 4}
                />
                {!isLBA1
                 // hasJetpack
                 && game.getState().flags.quest[LBA2Items.PROTO_PACK] === 2
                 && <BehaviourModeItem
                    divRef={itemNodes[8]}
                    behaviour={8}
                    behaviourChanged={behaviour}
                    selected={behaviour === 8}
                />}
            </>
        );
    } else if (behaviour === BehaviourModeType.ZOE) {
        behaviourModeItems = (
            <>
                <BehaviourModeItem
                    divRef={itemNodes[5]}
                    behaviour={5}
                    behaviourChanged={behaviour}
                    selected={behaviour === 5}
                />
            </>
        );
    }

    return (
        <div className="behaviourMenu">
            <div ref={behaviourModeRef} className="behaviourContainer">
                <div className="behaviourItemContainer">
                    {behaviourModeItems}
                </div>
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
