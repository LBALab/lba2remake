import {extend} from 'lodash';
import {makeContentComponent} from './content';

export function makeOutlinerArea(id, name, content, extensions = {}) {
    return {
        id: id,
        name: name,
        menu: extensions.menu,
        content: makeContentComponent(content, extensions.frame, extensions.style),
        getInitialState: () => ({
            path: []
        }),
        stateHandler: extend({
            setPath: function(path) {
                this.setState({path: path});
            }
        }, extensions.stateHandler)
    };
}
