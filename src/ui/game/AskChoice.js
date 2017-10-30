import React from 'react';
import {extend} from 'lodash';

import TextBox from './TextBox';

export default class AskChoice extends React.Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.state = { content: '', offset: 0, numChoices: 0 };
        this.interval = null;
    }

    componentWillMount() {

    }

    componentWillReceiveProps(newProps) {

    }

    componentWillUnmount() {

    }

    update() {

    }

    render() {
        return <div>
            <TextBox text={this.props.text} />
        </div>;
    }
}

