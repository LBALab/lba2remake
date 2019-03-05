import {extend} from 'lodash';
import {makeContentComponent} from './OutlinerAreaContent';

export function makeOutlinerArea(id, name, content, extensions = {}) {
    return {
        id,
        name,
        menu: extensions.menu,
        icon: extensions.icon,
        content: makeContentComponent(
            content,
            extensions.frame,
            extensions.style,
            extensions.separator
        ),
        getInitialState: () => ({
            path: []
        }),
        stateHandler: extend({
            setPath(path) {
                this.setState({path});
            }
        }, extensions.stateHandler)
    };
}
