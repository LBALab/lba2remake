import React, { useEffect, useState, useRef, Component } from 'react';
import * as THREE from 'three';

import '../styles/behaviour.scss';
import useMedia from '../hooks/useMedia';
import { BehaviourMode as BehaviourModeType } from '../../game/loop/hero';

import Renderer from '../../renderer';
import { get3DOrbitCamera } from '../editor/areas/model/utils/orbitCamera';

import { loadModel } from '../../model';
import { loadAnim } from '../../model/anim';
import { loadAnimState, updateKeyframeInterpolation, updateKeyframe } from '../../model/animState';
import { getAnim } from '../../model/entity';

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
    sceneManager: any;
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

let clock = null;
let canvas = null;
let renderer = null;
const scene = [];
const model = [];
const animState = [];

const createScene = () => {
    const camera = get3DOrbitCamera(0.3);
    const sce = {
        camera,
        threeScene: new THREE.Scene()
    };
    sce.threeScene.add(camera.controlNode);
    return sce;
};

const initBehaviourRenderer = async () => {
    scene.push(createScene());
    scene.push(createScene());
    scene.push(createScene());
    scene.push(createScene());
    scene.push(createScene());
    scene.push({}); // 5
    scene.push(createScene());
    scene.push({}); // 7
    scene.push(createScene());

    if (!clock) {
        clock = new THREE.Clock(false);
    }

    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.tabIndex = 0;
        canvas.className = 'behaviour-canvas';
    }

    if (!renderer) {
        renderer = new Renderer(
            { webgl2: true },
            canvas,
            { alpha: true },
            'behaviour-menu'
        );
    }
};

initBehaviourRenderer();

const updateModel = (m, anims, entityIdx, animIdx, time) => {
    const entity = m.entities[entityIdx];
    const entityAnim = getAnim(entity, animIdx);
    let interpolate = false;
    if (entityAnim !== null) {
        const realAnimIdx = entityAnim.animIndex;
        const anim = loadAnim(m, m.anims, realAnimIdx);
        anims.loopFrame = anim.loopFrame;
        if (anims.prevRealAnimIdx !== -1 && realAnimIdx !== anims.prevRealAnimIdx) {
            updateKeyframeInterpolation(anim, anims, time, realAnimIdx);
            interpolate = true;
        }
        if (realAnimIdx === anims.realAnimIdx || anims.realAnimIdx === -1) {
            updateKeyframe(anim, anims, time, realAnimIdx);
        }
        const q = new THREE.Quaternion();
        const delta = time.delta * 1000;
        let angle = 0;
        if (anims.keyframeLength > 0) {
            angle = (anims.rotation.y * delta) / anims.keyframeLength;
        }
        q.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            angle
        );
        m.mesh.quaternion.multiply(q);
    }
    return interpolate;
};

const renderLoop = (time, behaviour, selected, item) => {
    const m = model[behaviour];

    if (!item || !item.current || !m) {
        return;
    }

    const anims = animState[behaviour];
    const s = scene[behaviour];

    const canvasClip = canvas.getBoundingClientRect();
    // @ts-ignore
    const { left, right, top, bottom, width, height } = item.current.getBoundingClientRect();

    // set canvas size once with same aspect ratio as the behaviour item area
    if (canvas.width === 0) {
        canvas.width = canvas.style.width = width * 5;
        canvas.height = canvas.style.height = height * 5;
        renderer.resize(canvas.width, canvas.height);
    }

    const itemLeft = left - canvasClip.left;
    const itemBottom = canvasClip.bottom - bottom - 10;

    renderer.stats.begin();

    renderer.setViewport(itemLeft, itemBottom, width, height);
    renderer.setScissor(itemLeft, itemBottom, width, height);
    renderer.setScissorTest(true);

    if (selected) {
        updateModel(
            m,
            anims,
            behaviour,
            0,
            time
        );
    }
    s.camera.update(
        m,
        selected,
        { x: 0, y: 0},
        -0.9,
        time,
    );

    renderer.render(s);

    renderer.stats.end();
};

const load = async (b) => {
    if (model[b]) {
        return;
    }

    animState[b] = loadAnimState();

    const envInfo = {
        skyColor: [0, 0, 0]
    };
    const ambience = {
        lightingAlpha: 309,
        lightingBeta: 2500
    };
    model[b] = await loadModel(
        {},
        b,
        0,
        0,
        animState[b],
        envInfo,
        ambience
    );

    scene[b].threeScene.add(model[b].mesh);
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

const BehaviourMenu = ({ game }: IBehaviourMenuProps) => {
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
        6: useRef(null),
        8: useRef(null),
    };

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
                renderLoop(time, 8, behaviour === 8, itemNodes[8]);
            }
        });
        return () => {
        };
    }, [behaviour]);

    const loadUpdateModel = async (b) => {
        await load(b);
        updateModel(
            model[b],
            animState[b],
            b,
            0,
            { delta: 0, elapsed: 0}
        );
    };

    useEffect(() => {
        clock.start();
        loadUpdateModel(0);
        loadUpdateModel(1);
        loadUpdateModel(2);
        loadUpdateModel(3);
        loadUpdateModel(4);
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
    } else if (behaviour === BehaviourModeType.HORN) {
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
                <BehaviourModeItem
                    divRef={itemNodes[8]}
                    behaviour={8}
                    behaviourChanged={behaviour}
                    selected={behaviour === 8}
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
                    maxValue={255}
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
