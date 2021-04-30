import * as React from 'react';
import { fullscreen } from '../../../styles/index';

const fileSelectorWrapper = Object.assign({}, fullscreen, {
    background: 'rgba(0, 0, 0, 0.75)',
    padding: 20,
    textAlign: 'left' as const,
});

const fileInnerWrapper = {
    position: 'absolute' as const,
    right: 20,
    top: 20,
    bottom: 120,
    padding: 20,
    width: 350,
    background: 'grey',
    overflowY: 'scroll' as const,
    overflowX: 'auto' as const
};

const fileStyle = {
    cursor: 'pointer' as const,
    fontSize: 16,
    lineHeight: '20px',
    whiteSpace: 'nowrap' as const
};

const selectedFileStyle = {
    ...fileStyle,
    color: 'black',
    background: '#2b71ad'
};

const closeStyle = {
    position: 'absolute' as const,
    top: 22,
    right: 30,
    width: 24,
    height: 24,
    cursor: 'pointer' as const
};

interface Props {
    files: string[];
    useFile: (file: string) => void;
    close: () => void;
}

interface State {
    selected: number;
    files: string[];
}

export default class FileSelector extends React.Component<Props, State> {
    ref: HTMLDivElement;

    constructor(props) {
        super(props);
        this.filter = this.filter.bind(this);
        this.state = {
            selected: -1,
            files: props.files
        };
    }

    filter(e) {
        if (e.target.value) {
            const search = new RegExp(e.target.value.toLowerCase());
            this.setState({ files: this.props.files.filter(file => search.test(file))});
        } else {
            this.setState({ files: this.props.files });
        }
    }

    render() {
        const keyDownInput = (e) => {
            switch (e.key) {
                case 'Escape': break;
                case 'ArrowDown':
                    this.setState({ selected: 0 });
                    setTimeout(() => {
                        this.ref.focus();
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                default:
                    e.stopPropagation();
                    break;
            }
        };
        const keyDown = (e) => {
            switch (e.key) {
                case 'ArrowDown':
                    this.setState({ selected: this.state.selected + 1 });
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'ArrowUp':
                    this.setState({ selected: this.state.selected - 1 });
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'Enter':
                    if (this.state.selected !== -1) {
                        this.props.useFile(this.state.files[this.state.selected]);
                    }
                    break;
            }
        };
        return <div style={fileSelectorWrapper} onClick={() => this.props.close()}>
            <div style={fileInnerWrapper}
                ref={ref => this.ref = ref}
                onClick={e => e.stopPropagation()}
                onKeyDown={keyDown}
                tabIndex={1}
            >
                <div>
                    <input type="text"
                            style={{width: 250}}
                            placeholder="Search..."
                            onChange={this.filter}
                            onKeyDown={keyDownInput}
                            ref={(ref) => {
                                if (ref && this.state.selected === -1) {
                                    ref.focus();
                                }
                            }}/>
                </div>
                <br/>
                {this.state.files.map((f, idx) =>
                    <div key={f}
                        style={idx === this.state.selected ? selectedFileStyle : fileStyle}
                        onClick={this.props.useFile.bind(null, f)}>
                        <img src="editor/icons/gltf.svg" style={{height: 20}}/>
                        {f}
                    </div>)}
            </div>
            <img style={closeStyle}
                    src="./editor/icons/close.svg"
                    onClick={this.props.close}/>
        </div>;
    }
}
