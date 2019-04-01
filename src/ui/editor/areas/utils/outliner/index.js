import {extend} from 'lodash';
import {makeContentComponent} from './OutlinerAreaContent';

export function makeOutlinerArea(id, name, content, extensions = {}) {
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
        }, extensions.stateHandler)
    };
}
