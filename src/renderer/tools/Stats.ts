import {each} from 'lodash';

const containerStyle = `
width:80px;
opacity:0.9;
cursor:pointer;
position:absolute;
left:50%;
top:5px;
margin-left:-40px;
`;

const fpsDivStyle = `
padding:0 0 3px 3px;
text-align:left;
background-color:#002;
`;

const fpsTextStyle = `
color:#0ff;
font-family:Helvetica,Arial,sans-serif;
font-size:9px;
font-weight:bold;
line-height:15px;
`;

const fpsGraphStyle = `
position:relative;
width:74px;
height:30px;
background-color:#0ff;
`;

const msDivStyle = `
padding:0 0 3px 3px;
text-align:left;
background-color:#020;
display:block;
`;

const msTextStyle = `
color:#0f0;
font-family:Helvetica,Arial,sans-serif;
font-size:9px;
font-weight:bold;
line-height:15px;
`;

const msGraphStyle = `
position:relative;
width:74px;
height:30px;
background-color:#0f0;
`;

const barStyle = `
width:1px;
height:30px;
float:left;
background-color:#131
`;

class StatsWidget {
    domElement: HTMLDivElement;
    fpsDiv: HTMLDivElement;
    fpsText: HTMLDivElement;
    fpsGraph: HTMLDivElement;
    msDiv: HTMLDivElement;
    msGraph: HTMLDivElement;
    msText: HTMLDivElement;

    constructor() {
        const container = document.createElement('div');
        container.id = 'stats';
        container.style.cssText = containerStyle;

        this.fpsDiv = document.createElement('div');
        this.fpsDiv.id = 'fps';
        this.fpsDiv.style.cssText = fpsDivStyle;
        container.appendChild(this.fpsDiv);

        this.fpsText = document.createElement('div');
        this.fpsText.id = 'fpsText';
        this.fpsText.style.cssText = fpsTextStyle;
        this.fpsText.innerHTML = 'FPS';
        this.fpsDiv.appendChild(this.fpsText);

        this.fpsGraph = document.createElement('div');
        this.fpsGraph.id = 'fpsGraph';
        this.fpsGraph.style.cssText = fpsGraphStyle;
        this.fpsDiv.appendChild(this.fpsGraph);

        while (this.fpsGraph.children.length < 74) {
            const bar = document.createElement('span');
            bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
            this.fpsGraph.appendChild(bar);
        }

        this.msDiv = document.createElement('div');
        this.msDiv.id = 'ms';
        this.msDiv.style.cssText = msDivStyle;
        container.appendChild(this.msDiv);

        this.msText = document.createElement('div');
        this.msText.id = 'msText';
        this.msText.style.cssText = msTextStyle;
        this.msText.innerHTML = 'MS';
        this.msDiv.appendChild(this.msText);

        this.msGraph = document.createElement('div');
        this.msGraph.id = 'msGraph';
        this.msGraph.style.cssText = msGraphStyle;
        this.msDiv.appendChild(this.msGraph);

        while (this.msGraph.children.length < 74) {
            const bar = document.createElement('span');
            bar.style.cssText = barStyle;
            this.msGraph.appendChild(bar);
        }

        this.domElement = container;
    }

    updateGraph(dom, value) {
        const child = dom.appendChild(dom.firstChild);
        child.style.height = `${value}px`;
    }
}

export default class Stats {
    startTime: number;
    prevTime: number;
    ms: number;
    msMin: number;
    msMax: number;
    fps: number;
    fpsMin: number;
    fpsMax: number;
    frames: number;
    widgets: StatsWidget[];

    constructor(numWidgets) {
        numWidgets = numWidgets || 1;
        this.startTime = Date.now();
        this.prevTime = this.startTime;
        this.ms = 0;
        this.msMin = Infinity;
        this.msMax = 0;
        this.fps = 0;
        this.fpsMin = Infinity;
        this.fpsMax = 0;
        this.frames = 0;
        this.widgets = [];
        for (let i = 0; i < numWidgets; i += 1) {
            this.widgets.push(new StatsWidget());
        }
    }

    begin() {
        this.startTime = Date.now();
    }

    end() {
        const time = Date.now();

        this.ms = time - this.startTime;
        this.msMin = Math.min(this.msMin, this.ms);
        this.msMax = Math.max(this.msMax, this.ms);

        each(this.widgets, (widget) => {
            widget.msText.textContent = `${this.ms} MS (${this.msMin}-${this.msMax})`;
            widget.updateGraph(widget.msGraph, Math.min(30, 30 - ((this.ms / 200) * 30)));
        });

        this.frames += 1;

        if (time > this.prevTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
            this.fpsMin = Math.min(this.fpsMin, this.fps);
            this.fpsMax = Math.max(this.fpsMax, this.fps);

            each(this.widgets, (widget) => {
                widget.fpsText.textContent = `${this.fps} FPS (${this.fpsMin}-${this.fpsMax})`;
                widget.updateGraph(widget.fpsGraph, Math.min(30, 30 - ((this.fps / 100) * 30)));
            });

            this.prevTime = time;
            this.frames = 0;
        }
        return time;
    }
}
