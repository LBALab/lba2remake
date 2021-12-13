import { BakeParams } from '../../../../../graphics/gi/baking/bake';
import BakingAreaContent from './BakingAreaContent';

const GLTFViewer = {
    id: 'baking',
    name: 'Baking',
    icon: 'light.svg',
    content: BakingAreaContent,
    getInitialState: (): BakeParams => ({
        textureSize: 512,
        samples: 50,
        margin: 2,
        denoise: 'FAST',
        dumpAfter: 'none',
        hdriRotation: 0,
        hdriExposure: 1,
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
        },
        setHdri(hdri) {
            this.setState({ hdri });
        },
        setHdriRotation(hdriRotation) {
            this.setState({ hdriRotation });
        },
        setHdriExposure(hdriExposure) {
            this.setState({ hdriExposure });
        }
    }
};

export default GLTFViewer;
