import {extend} from 'lodash';
import {makeContentComponent} from './OutlinerAreaContent';
import { CSSProperties } from 'react';

interface Extensions {
    icon?: string;
    frame?: Function;
    style?: CSSProperties;
    separator?: string;
    hideRoot?: boolean;
    stateHandler?: any;
    settings?: any;
}

export function makeOutlinerArea(id, name, content, extensions: Extensions = {}) {
    return {
        id,
        name,
        icon: extensions.icon,
        content: makeContentComponent(
            content,
            extensions.frame,
            extensions.style,
            extensions.separator,
            extensions.hideRoot
        ),
        getInitialState: () => ({
            path: [],
            prettyPath: []
        }),
        stateHandler: extend({
            setPath(path, prettyPath) {
                this.setState({path, prettyPath});
            }
        }, extensions.stateHandler),
        settings: extensions.settings
    };
}
