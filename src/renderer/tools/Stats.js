import {each} from 'lodash';

class StatsWidget {
    constructor(owner) {
        const container = document.createElement('div');
        container.id = 'stats';
        container.addEventListener('mousedown', (event) => {
            event.preventDefault();
            event.stopPropagation();
            owner.mode += 1;
            owner.setMode(owner.mode % 2);
        }, false);
        container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer;position:absolute;left:50%;top:5px;margin-left:-40px;';

        this.fpsDiv = document.createElement('div');
        this.fpsDiv.id = 'fps';
        this.fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
        container.appendChild(this.fpsDiv);

        this.fpsText = document.createElement('div');
        this.fpsText.id = 'fpsText';
        this.fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
        this.fpsText.innerHTML = 'FPS';
        this.fpsDiv.appendChild(this.fpsText);

        this.fpsGraph = document.createElement('div');
        this.fpsGraph.id = 'fpsGraph';
        this.fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
        this.fpsDiv.appendChild(this.fpsGraph);

        while (this.fpsGraph.children.length < 74) {
            const bar = document.createElement('span');
            bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
            this.fpsGraph.appendChild(bar);
        }

        this.msDiv = document.createElement('div');
        this.msDiv.id = 'ms';
        this.msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
        container.appendChild(this.msDiv);

        this.msText = document.createElement('div');
        this.msText.id = 'msText';
        this.msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
        this.msText.innerHTML = 'MS';
        this.msDiv.appendChild(this.msText);

        this.msGraph = document.createElement('div');
        this.msGraph.id = 'msGraph';
        this.msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
        this.msDiv.appendChild(this.msGraph);

        while (this.msGraph.children.length < 74) {
            const bar = document.createElement('span');
            bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
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
        this.mode = 0;
        this.widgets = [];
        for (let i = 0; i < numWidgets; i += 1) {
            this.widgets.push(new StatsWidget(this));
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
            widget.updateGraph(widget.msGraph, Math.min(30, 30 - (this.ms / 200) * 30));
        });

        this.frames += 1;

        if (time > this.prevTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
            this.fpsMin = Math.min(this.fpsMin, this.fps);
            this.fpsMax = Math.max(this.fpsMax, this.fps);

            each(this.widgets, (widget) => {
                widget.fpsText.textContent = `${this.fps} FPS (${this.fpsMin}-${this.fpsMax})`;
                widget.updateGraph(widget.fpsGraph, Math.min(30, 30 - (this.fps / 100) * 30));
            });

            this.prevTime = time;
            this.frames = 0;
        }
        return time;
    }

    setMode(value) {
        this.mode = value;
        switch (this.mode) {
            case 0:
                each(this.widgets, (widget) => {
                    widget.fpsDiv.style.display = 'block';
                    widget.msDiv.style.display = 'none';
                });
                break;
            case 1:
                each(this.widgets, (widget) => {
                    widget.fpsDiv.style.display = 'none';
                    widget.msDiv.style.display = 'block';
                });
                break;
        }
    }
}
