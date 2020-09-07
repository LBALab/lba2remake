import React, { useEffect, useState, useRef } from 'react';

import '../styles/inventory.scss';
import {
    createOverlayClock,
    createOverlayRenderer,
    createOverlayCanvas,
    loadSceneInventoryModel,
    createOverlayScene
} from './overlay';

const FoundObject = ({ foundObject }) => {
    const itemRef = useRef(null);
    const [model, setModel] = useState(null);
    const [scene, setScene] = useState(null);
    const [clock, setClock] = useState(null);
    const [canvas, setCanvas] = useState(null);
    const [renderer, setRenderer] = useState(null);

    const renderLoop = (time, sce, m,  item) => {
        if (!item || !item.current || !m) {
            return;
        }

        const canvasClip = canvas.getBoundingClientRect();
        const { left, bottom, width, height } = item.current.getBoundingClientRect();

        // set canvas size once with same aspect ratio as the found object item area
        if (canvas.width === 0) {
            canvas.width = canvas.style.width = width * 5;
            canvas.height = canvas.style.height = height * 5;
            renderer.resize(canvas.width, canvas.height);
        }

        const itemLeft = left - canvasClip.left;
        const itemBottom = canvasClip.bottom - bottom;

        renderer.stats.begin();

        renderer.setViewport(itemLeft, itemBottom, width, height);
        renderer.setScissor(itemLeft, itemBottom, width, height);
        renderer.setScissorTest(true);

        sce.camera.update(
            m,
            true,
            { x: 0, y: 0},
            2.5,
            time,
        );

        renderer.render(sce);
        renderer.stats.end();
    };

    useEffect(() => {
        setClock(createOverlayClock());
        setCanvas(createOverlayCanvas('foundObject-canvas'));
        setScene(createOverlayScene(3));
    }, []);

    useEffect(() => {
        if (scene) {
            setModel(loadSceneInventoryModel(scene, foundObject));
        }
    }, [scene]);

    useEffect(() => {
        if (clock) {
            clock.start();
        }
        return () => {
            if (clock) {
                clock.stop();
            }
        };
    }, [clock]);

    useEffect(() => {
        if (canvas) {
            if (renderer === null) {
                setRenderer(createOverlayRenderer(canvas, 'foundObject'));
            }
            itemRef.current.appendChild(canvas);
        }
        return () => { };
    }, [canvas]);

    useEffect(() => {
        if (renderer) {
            renderer.threeRenderer.setAnimationLoop(() => {
                if (scene && model) {
                    const time = {
                        delta: Math.min(clock.getDelta(), 0.05),
                        elapsed: clock.getElapsedTime(),
                    };
                renderLoop(time, scene, model, itemRef);
                }
            });
        }
        return () => {
            if (renderer) {
                renderer.threeRenderer.setAnimationLoop(null);
            }
        };
    }, [renderer]);

    if (foundObject !== null) {
        return <div ref={itemRef} className="foundObject" />;
    }
    return null;
};

export default FoundObject;
