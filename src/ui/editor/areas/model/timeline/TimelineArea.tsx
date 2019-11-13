import React from 'react';

const TimelineArea = {
    id: 'timeline',
    name: 'Timeline',
    icon: 'timeline.png',
    content: TimelineAreaContent,
    getInitialState: () => ({})
};

export default TimelineArea;

export function TimelineAreaContent(/* props */) {
    return <div>Timeline</div>;
}
