import BakingAreaContent from './BakingAreaContent';

const GLTFViewer = {
    id: 'baking',
    name: 'Baking',
    icon: 'light.svg',
    content: BakingAreaContent,
    getInitialState: () => ({
        textureSize: 512,
        samples: 50,
        margin: 2,
        denoise: 'FAST',
        dumpAfter: 'none',
    }),
    stateHandler: {
        setTextureSize(textureSize) {
            this.setState({ textureSize });
        },
        setSamples(samples) {
            this.setState({ samples });
        },
        setMargin(margin) {
            this.setState({ margin });
        },
        setDenoise(denoise) {
            this.setState({ denoise });
        },
        setDumpAfter(dumpAfter) {
            this.setState({ dumpAfter });
        }
    }
};

export default GLTFViewer;
