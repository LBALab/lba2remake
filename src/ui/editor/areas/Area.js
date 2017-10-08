import React from 'react';
import {fullscreen} from '../../styles';
import {style as tsStyle} from './ToolShelf';

export default class Area extends React.Component {
    constructor(props) {
        super(props);
        this.toggleToolShelf = this.toggleToolShelf.bind(this);
        this.state = {
            toolShelfEnabled: false
        };
    }

    render() {
        return <div style={fullscreen}>
            {this.renderContent()}
            {this.renderToolShelf()}
        </div>;
    }

    renderToolShelf() {
        if (this.toolShelf && this.state.toolShelfEnabled) {
            return React.createElement(this.toolShelf, {
                params: this.props.params,
                ticker: this.props.ticker,
                close: this.toggleToolShelf
            });
        } else {
            return <div style={tsStyle.openButton} onClick={this.toggleToolShelf}>+</div>;
        }
    }

    toggleToolShelf() {
        this.setState({toolShelfEnabled: !this.state.toolShelfEnabled});
    }
}
