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
                        { source: renderer.domElement }
                    ]);
                }
            };
            renderer.vr.setDevice(device);
        }

        function showVRNotFound() {
            button.style.display = '';

            button.style.cursor = 'auto';
            button.style.left = 'calc(50% - 75px)';
            button.style.width = '150px';

            button.textContent = 'VR NOT FOUND';

            button.onmouseenter = null;
            button.onmouseleave = null;

            button.onclick = null;

            renderer.vr.setDevice(null);
        }

        function stylizeElement(element) {
            element.style.position = 'absolute';
            element.style.bottom = '20px';
            element.style.padding = '12px 6px';
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
                showVRNotFound();
            }, false);

            window.addEventListener('vrdisplaypresentchange', (event) => {
                button.textContent = event.display.isPresenting
                    ? 'EXIT VR'
                    : 'ENTER VR';
            }, false);

            window.addEventListener('vrdisplayactivate', (event) => {
                event.display.requestPresent([
                    { source: renderer.domElement }
                ]);
            }, false);

            navigator.getVRDisplays()
                .then((displays) => {
                    if (displays.length > 0) {
                        showEnterVR(displays[0]);
                    } else {
                        showVRNotFound();
                    }
                })
                .catch(showVRNotFound);

            return button;
        }

        return null;
    }
};

export default WebVR;
