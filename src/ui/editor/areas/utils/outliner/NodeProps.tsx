import React from 'react';
import {extend, isObject, map} from 'lodash';

const propStyle = {
    paddingLeft: 8,
    verticalAlign: 'top',
    display: 'inline-block'
};

export default class NodeProps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodeProps: this.props.nodeProps()
        };
    }

    componentWillMount() {
        if (this.props.dynamic) {
            this.props.ticker.register(this);
        }
    }

    componentWillUnmount() {
        if (this.props.dynamic) {
            this.props.ticker.unregister(this);
        }
    }

    frame() {
        if (this.props.dynamic) {
            const nodeProps = this.props.nodeProps();
            const oldProps = this.state.nodeProps;
            if (nodeProps.length !== oldProps.length) {
                this.setState({nodeProps});
            } else {
                for (let i = 0; i < nodeProps.length; i += 1) {
                    let foundDiff = false;
                    const p = nodeProps[i];
                    const op = oldProps[i];
                    if (p.id !== op.id) {
                        foundDiff = true;
                    } else if (typeof (p.value) !== typeof (op.value)) {
                        foundDiff = true;
                    } else if (isObject(p.value) && isObject(op.value)) {
                        if (p.value.key !== op.value.key) {
                            foundDiff = true;
                        }
                    } else if (p.value !== op.value) {
                        foundDiff = true;
                    }
                    if (foundDiff) {
                        this.setState({nodeProps});
                        break;
                    }
                }
            }
        }
    }

    render() {
        const nodeProps = this.state.nodeProps;
        if (!nodeProps) {
            return null;
        }

        return <span style={{color: '#858585'}}>
            {
                map(nodeProps, prop =>
                    (prop.render ? <span
                        key={prop.id}
                        style={extend({}, propStyle, prop.style)}
                    >
                        {prop.render(prop.value, this)}
                    </span> : null))
            }
        </span>;
    }
}
