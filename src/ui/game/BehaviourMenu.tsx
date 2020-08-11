import React, { useEffect, useState, useRef } from 'react';
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

let scene = null;
let clock = null;
let canvas = null;
let renderer = null;
let model = null;
let animState = null;

const BehaviourModeItem = ({ selected, behaviour, ...rest }) => {
    const itemRef = useRef(null);
    useEffect(() => {
        if (selected && canvas) {
            canvas.width = canvas.style.width = itemRef.current.offsetWidth - 2;
            canvas.height = canvas.style.height = itemRef.current.offsetHeight - 2;
            renderer.resize(canvas.width, canvas.height);
            itemRef.current.appendChild(canvas);
        }
    }, [selected]);

    const load = async () => {
        animState = loadAnimState();

        const envInfo = {
            skyColor: [0, 0, 0]
        };
        const ambience = {
            lightingAlpha: 309,
            lightingBeta: 2500
        };
        model = await loadModel(
            {},
            behaviour,
            // props.bodyIndex,
            // props.animIndex,
            0,
            0,
            animState,
            envInfo,
            ambience
        );

        if (scene &&
            scene.threeScene &&
            scene.threeScene.children &&
            scene.threeScene.children.length > 1) {
            scene.threeScene.remove(scene.threeScene.children[1]);
        }

        scene.threeScene.add(model.mesh);
    };

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

    useEffect(() => {
        const onload = async () => {
            if (!scene) {
                const camera = get3DOrbitCamera(0.3);
                scene = {
                    camera,
                    threeScene: new THREE.Scene()
                };
                scene.threeScene.add(camera.controlNode);
            }

            if (!clock) {
                clock = new THREE.Clock(false);
                clock.start();
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
                    {},
                    'behaviour-menu'
                );
                renderer.setClearColor(0x409da0);
            }
        };
        onload();
        return () => {
            renderer.threeRenderer.setAnimationLoop(null);
        };
    }, []);

    useEffect(() => {
        const asyncLoad = async () => {
            if (scene) {
                await load();
                renderer.threeRenderer.setAnimationLoop(() => {
                    const time = {
                        delta: Math.min(clock.getDelta(), 0.05),
                        elapsed: clock.getElapsedTime()
                    };
                    renderer.stats.begin();
                    updateModel(
                        model,
                        animState,
                        behaviour,
                        // props.animIndex,
                        0,
                        time
                    );
                    scene.camera.update(model, true, { x: 0, y: 0}, -0.9, time);
                    renderer.render(scene);
                    renderer.stats.end();
                });
            }
        };
        asyncLoad();
    }, [behaviour]);

    return (
        <div
            ref={itemRef}
            className={`behaviourItem${selected ? ' selected' : ''}`}
            {...rest}
        >
        </div>
    );
};

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

    const listener = (event) => {
        let behav = behaviour;
        const key = event.code || event.which || event.keyCode;
        switch (key) {
            case 37:
            case 'ArrowLeft':
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
                <BehaviourModeItem behaviour={behaviour} selected={behaviour === 0} />
                <BehaviourModeItem behaviour={behaviour} selected={behaviour === 1} />
                <BehaviourModeItem behaviour={behaviour} selected={behaviour === 2} />
                <BehaviourModeItem behaviour={behaviour} selected={behaviour === 3} style={{
                    marginRight: '0px'
                }} />
            </div>
        );
    } else if (behaviour === BehaviourModeType.HORN) {
        behaviourModeItems = (
            <div className="behaviourItemContainer">
                <BehaviourModeItem behaviour={behaviour} selected={behaviour === 6} />
            </div>
        );
    } else if (behaviour === BehaviourModeType.PROTOPACK ||
               behaviour === BehaviourModeType.JETPACK) {
        behaviourModeItems = (
            <div className="behaviourItemContainer">
                <BehaviourModeItem behaviour={behaviour} selected={behaviour === 4} />
                <BehaviourModeItem behaviour={behaviour} selected={behaviour === 8} />
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
