import * as React from 'react';
import { bake, BakeParams, BakeProgress, ProgressHandler } from '../../../../../graphics/gi/baking/bake';

interface Props {
    sharedState: BakeParams;
    stateHandler: {
        setTextureSize: (value: number) => void;
        setSamples: (value: number) => void;
        setMargin: (value: number) => void;
        setDenoise: (value: 'NONE' | 'FAST' | 'ACCURATE') => void;
        setDumpAfter: (value: string) => void;
    };
}

interface StageProgress {
    name: string;
    progress: number;
    duration?: number;
    cancelled: boolean;
    details: string[];
    eta?: number;
}

interface BakeProgressHistory {
    stages: StageProgress[];
}

interface State {
    baking: boolean;
    progress?: BakeProgressHistory;
    appliedParams?: BakeParams;
    error?: string;
    done: boolean;
    time?: number;
}

const POSSIBLE_TEXTURE_SIZES = [32, 64, 128, 256, 512, 1024, 2048, 4096];
const POSSIBLE_DENOISE_MODES = ['NONE', 'FAST', 'ACCURATE'];
const POSSIBLE_DUMP_VALUES = ['none', 'import', 'bake', 'denoise', 'apply'];

const wrapperStyle = {
    padding: '1em',
    overflow: 'hidden auto',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

const progressStyle = {
    background: 'black',
    padding: '1em',
    marginTop: '1em',
    lineHeight: '2em',
    border: '1px solid lightgrey'
};

const formLineStyle = {
    position: 'relative' as const,
    height: '2em',
    lineHeight: '2em',
    verticalAlign: 'middle',
    borderBottom: '1px dotted rgba(255, 255, 255, 0.3)'
};

const formControlStyle = {
    position: 'absolute' as const,
    lineHeight: 'normal',
    bottom: 0,
    right: 0,
    paddingBottom: '0.2em'
};

export default class BakingAreaContent extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.bakeLighting = this.bakeLighting.bind(this);
        this.cancel = this.cancel.bind(this);
        this.onProgress = this.onProgress.bind(this);

        this.state = {
            baking: false,
            progress: null,
            done: false,
            error: null
        };
    }

    async bakeLighting() {
        const { sharedState } = this.props;
        const appliedParams = {
            ...sharedState,
            startProgress: startProgress.bind(null, this.onProgress),
            cancelled: false
        };
        this.setState({
            error: null,
            done: false,
            baking: true,
            appliedParams,
            progress: { stages: [] }
        }, async () => {
            const start = Date.now();
            try {
                await bake(appliedParams);
            } catch (error) {
                if (error.message !== 'Cancelled') {
                    console.error('Failed to bake: ', error);
                }
                const { progress } = this.state;
                const lastStage = progress.stages[0];
                if (lastStage) {
                    lastStage.cancelled = true;
                    lastStage.duration = 0;
                    delete lastStage.eta;
                } else {
                    progress.stages.unshift({
                        name: 'Error',
                        progress: 0,
                        duration: 0,
                        cancelled: true,
                        details: [],
                    });
                }
                this.setState({ progress, error: error.message });
            }
            const time = Date.now() - start;
            this.setState({ baking: false, appliedParams: null, done: true, time });
        });
    }

    cancel() {
        const { appliedParams } = this.state;
        if (appliedParams) {
            appliedParams.cancelled = true;
            this.setState({ appliedParams });
        }
    }

    render() {
        const { sharedState, stateHandler } = this.props;
        const { baking } = this.state;
        return <div style={wrapperStyle}>
            <div>
                <div style={formLineStyle}>
                    Lightmap size:
                    <div style={formControlStyle}>
                        <select value={sharedState.textureSize}
                                onChange={e => stateHandler.setTextureSize(Number(e.target.value))}>
                            {POSSIBLE_TEXTURE_SIZES
                                .map(sz => <option key={sz} value={sz}>{sz}</option>)}
                        </select>
                    </div>
                </div>
                <div style={formLineStyle}>
                    Samples:
                    <div style={formControlStyle}>
                        <input type="number"
                                value={sharedState.samples}
                                min={8}
                                max={6000}
                                onChange={e => stateHandler.setSamples(Number(e.target.value))}/>
                    </div>
                </div>
                <div style={formLineStyle}>
                    Margin:
                    <div style={formControlStyle}>
                        <input type="number"
                                value={sharedState.margin}
                                min={0}
                                max={32}
                                onChange={e => stateHandler.setMargin(Number(e.target.value))}/>
                    </div>
                </div>
                <div style={formLineStyle}>
                    Denoise:
                    <div style={formControlStyle}>
                        <select value={sharedState.denoise}
                                onChange={e => stateHandler.setDenoise(e.target.value as any)}>
                            {POSSIBLE_DENOISE_MODES
                                .map(dn => <option key={dn} value={dn}>{dn}</option>)}
                        </select>
                    </div>
                </div>
                <div style={formLineStyle}>
                    Dump blender file after:
                    <div style={formControlStyle}>
                        <select value={sharedState.dumpAfter}
                                onChange={e => stateHandler.setDumpAfter(e.target.value as any)}>
                            {POSSIBLE_DUMP_VALUES
                                .map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
                <br/>
                {<div style={{marginBottom: '2em'}}>
                    &nbsp;
                    {
                        baking
                        ? <button style={{float: 'right'}} onClick={this.cancel}>
                            Cancel ❌
                        </button>
                        : <button id="startBaking"
                                    style={{float: 'right'}}
                                    onClick={this.bakeLighting}>
                            Start baking 🟢
                        </button>
                    }
                    </div>}
                {this.renderProgress()}
            </div>
        </div>;
    }

    onProgress(bakeProgress: BakeProgress) {
        const { progress } = this.state;
        const { stages } = progress;
        let lastStage = stages[0];
        if (!lastStage || lastStage.name !== bakeProgress.stage) {
            lastStage = {
                name: bakeProgress.stage,
                progress: bakeProgress.value,
                cancelled: bakeProgress.cancelled,
                details: [],
            };
            stages.unshift(lastStage);
        }
        if (bakeProgress.details) {
            lastStage.details.unshift(bakeProgress.details);
        }
        lastStage.cancelled = bakeProgress.cancelled;
        if (bakeProgress.value !== undefined) {
            lastStage.progress = bakeProgress.value;
        }
        if (bakeProgress.duration !== undefined) {
            lastStage.duration = bakeProgress.duration;
        }
        if (!lastStage.duration && lastStage.progress && bakeProgress.stageStartTime) {
            const elapsed = Date.now() - bakeProgress.stageStartTime;
            lastStage.eta = Math.round(
                (elapsed * (1 - lastStage.progress)) / lastStage.progress
            );
        } else {
            lastStage.eta = undefined;
        }

        this.setState({ progress });
    }

    renderProgress() {
        const { progress, error, done, time } = this.state;
        if (!progress) {
            return null;
        }

        const { stages } = progress;

        const stageStyle = {
            background: '#1A1A1A',
            marginBottom: '0.5em',
            padding: '0 0.5em'
        };

        return <div style={progressStyle}>
            {done && !error && <div style={{color: '#33FF88'}}>
                    Done!
                    <span style={{color: 'lightblue', float: 'right'}}>
                        <span style={{color: 'white'}}>
                            {fDuration(time)}&nbsp;✅
                        </span>
                    </span>
                </div>}
            {error && <div style={{color: '#FF6655'}}>❌ ERROR: {error}</div>}
            {stages.map((stage, idx) =>
                 <div key={stage.name} style={stageStyle}>
                    <div style={{opacity: idx || done ? 0.6 : 1}}>Stage:&nbsp;
                        <span style={{color: '#FFBBBB'}}>{stage.name}</span>
                    </div>
                    <div style={{paddingLeft: '2em', opacity: idx || done ? 0.6 : 1}}>
                        {stage.duration !== undefined
                            ? `Stage ${stage.cancelled ? 'cancelled' : 'completed'}`
                            : 'In progress...'}
                        <span style={{color: 'lightblue', float: 'right'}}>
                            {
                                stage.duration !== undefined
                                    ? <span style={{color: 'white'}}>
                                        {fDuration(stage.duration)}&nbsp;
                                        {stage.cancelled ? '❌' : '✅'}
                                    </span>
                                    : <span>
                                        {Math.round(stage.progress * 100)}% 🔄
                                    </span>
                            }
                        </span>
                    </div>
                    {(stage.duration === undefined && stage.eta !== undefined) &&
                        <div style={{minHeight: '2em', fontStyle: 'italic'}}>
                            <span style={{color: 'lightblue', float: 'right'}}>
                                ETA:&nbsp;
                                <span style={{color: 'lightgrey', fontStyle: 'normal'}}>
                                    {fDuration(stage.eta)} ⏱️
                                </span>
                            </span>
                        </div>}
                    <div style={{paddingLeft: '3em', opacity: idx || done ? 0.6 : 1}}>
                        {stage.details.map((detail, idx2) =>
                            <div key={detail}>{idx2 || idx || done ? <>&nbsp;</> : '‣'}&nbsp;
                                <span style={{color: 'lightblue'}}>{detail}</span>
                            </div>)}
                    </div>
                </div>
            )}
        </div>;
    }
}

function fDuration(duration) {
    const min = String(Math.floor(duration / 60000)).padStart(2, '0');
    const sec = String(Math.floor((duration % 60000) / 1000)).padStart(2, '0');
    const ms = String(duration % 1000).padEnd(3, '0');
    return `${min}:${sec}.${ms}`;
}

function startProgress(
    onProgress: (progress: BakeProgress) => void,
    name: string,
    details?: string
): ProgressHandler {
    const stageStartTime = Date.now();
    let value = 0;
    onProgress({
        stage: name,
        value: 0,
        details,
        stageStartTime,
        cancelled: false,
    });
    return {
        cancel: () => {
            onProgress({
                stage: name,
                stageStartTime,
                value,
                duration: Date.now() - stageStartTime,
                cancelled: true,
            });
        },
        progress: (v: number, newDetails?: string) => {
            value = v;
            onProgress({
                stage: name,
                stageStartTime,
                value,
                details: newDetails,
                cancelled: false,
            });
        },
        done: () => {
            onProgress({
                stage: name,
                stageStartTime,
                value: 1,
                duration: Date.now() - stageStartTime,
                cancelled: false,
            });
        }
    };
}
