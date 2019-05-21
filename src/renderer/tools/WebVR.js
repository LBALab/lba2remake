let button = null;

const WebVR = {
    createButton(renderer, options) {
        if (options && options.frameOfReferenceType) {
            renderer.vr.setFrameOfReferenceType(options.frameOfReferenceType);
        }

        function showEnterVR(device) {
            button.style.display = '';
            button.style.cursor = 'pointer';
            button.style.left = 'calc(50% - 50px)';
            button.style.width = '100px';
            button.textContent = 'ENTER VR';
            button.onmouseenter = function onmouseenter() {
                button.style.opacity = '1.0';
            };
            button.onmouseleave = function onmouseleave() {
                button.style.opacity = '0.5';
            };
            button.onclick = function onclick() {
                if (device.isPresenting) {
                    device.exitPresent();
                } else {
                    device.requestPresent([
                        {
                            source: renderer.domElement,
                            attributes: {
                                highRefreshRate: true,
                                foveationLevel: 3,
                                antialias: true
                            }
                        }
                    ]);
                }
            };
            renderer.vr.setDevice(device);
        }

        function stylizeElement(element) {
            element.style.position = 'absolute';
            element.style.bottom = '12px';
            element.style.padding = '6px 6px';
            element.style.border = '1px solid #fff';
            element.style.borderRadius = '4px';
            element.style.background = 'rgba(0,0,0,0.1)';
            element.style.color = '#fff';
            element.style.font = 'normal 13px sans-serif';
            element.style.textAlign = 'center';
            element.style.opacity = '0.5';
            element.style.outline = 'none';
            element.style.zIndex = '999';
        }

        if ('getVRDisplays' in navigator) {
            button = document.createElement('button');
            button.style.display = 'none';

            stylizeElement(button);

            window.addEventListener('vrdisplayconnect', (event) => {
                showEnterVR(event.display);
            }, false);

            window.addEventListener('vrdisplaydisconnect', () => {
                button.style.display = 'none';
            }, false);

            window.addEventListener('vrdisplaypresentchange', (event) => {
                button.textContent = event.display.isPresenting
                    ? 'EXIT VR'
                    : 'ENTER VR';
            }, false);

            window.addEventListener('vrdisplayactivate', (event) => {
                event.display.requestPresent([
                    {
                        source: renderer.domElement,
                        attributes: {
                            highRefreshRate: true,
                            foveationLevel: 3,
                            antialias: true
                        }
                    }
                ]);
            }, false);

            navigator.getVRDisplays()
                .then((displays) => {
                    if (displays.length > 0) {
                        showEnterVR(displays[0]);
                    } else {
                        button.style.display = 'none';
                    }
                })
                .catch(() => {
                    button.style.display = 'none';
                });

            return button;
        }

        return null;
    }
};

export default WebVR;
