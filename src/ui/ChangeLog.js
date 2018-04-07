/* eslint-disable react/no-multi-comp */
import React from 'react';
import {map, filter} from 'lodash';
import {versions} from '../../changelog.yaml';
import {version as currentVersion} from '../../package.json';

const BASE_API_URL = 'https://api.github.com/repos/agrande/lba2remake';
const BASE_URL = 'https://github.com/agrande/lba2remake';

const bg_style = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.75)'
};

const inner_style = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 50,
    background: 'black',
    border: '2px outset #61cece',
    borderRadius: 15
};

function TagIcon() {
    return <img src="./images/label.png" style={{width: 16, height: 16, paddingRight: 4}}/>;
}

/**
 * @return {null}
 */
function VersionDate({date}) {
    if (date) {
        return <span style={{float: 'right', fontSize: 14}}>{date}&nbsp;</span>;
    }
    return <span style={{float: 'right', fontSize: 14, fontStyle: 'italic'}}>Unreleased&nbsp;</span>;
}

function VersionTitle({version}) {
    const isCurrent = version.tag === currentVersion;
    let currentText;
    let title;
    if (isCurrent) {
        currentText = <span style={{fontSize: 14, color: 'rgb(100, 255, 100)'}}>&nbsp;(current version)</span>;
    }
    if (version.title) {
        title = <span>&nbsp;{version.title}</span>;
    }
    return <span style={{color: 'white'}}>
        {currentText}
        {title}
    </span>;
}

export default class ChangeLog extends React.Component {
    constructor(props) {
        super(props);
        this.renderVersion = this.renderVersion.bind(this);
        this.renderChangeGroup = this.renderChangeGroup.bind(this);
        this.state = {
            expanded: {
                [currentVersion]: true,
            }
        };
    }

    render() {
        const closeStyle = {
            position: 'absolute',
            top: 0,
            right: 0,
            width: 24,
            height: 24,
            cursor: 'pointer'
        };

        const content_style = {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: 15,
            color: 'white',
            overflowY: 'auto',
            overflowX: 'hidden',
            fontSize: '20px',
            fontFamily: 'LBA'
        };

        const content = <div style={content_style}>
            {this.props.close && <img style={closeStyle} src="./editor/icons/close.png" onClick={this.props.close}/>}
            {this.props.title && <div style={{fontSize: 26, textDecoration: 'underline'}}>LBA2 Remake</div>}
            {this.props.title && <div style={{paddingBottom: 20}}>Versions history</div>}
            <div>
                {map(versions, this.renderVersion)}
            </div>
        </div>;

        if (this.props.fullscreen) {
            return <div style={bg_style} onClick={this.props.close}>
                <div style={inner_style} onClick={e => e.stopPropagation()}>
                    {content}
                </div>
            </div>;
        }
        return content;
    }

    toggleExpand(tag) {
        const expanded = this.state.expanded;
        if (tag in expanded) {
            delete expanded[tag];
        } else {
            expanded[tag] = true;
        }
        this.setState({expanded});
    }

    renderVersion(version) {
        const expanded = this.state.expanded;
        const isExpanded = version.tag in expanded;
        const toggle = () => this.toggleExpand(version.tag);
        const expanderStyle = {
            width: '24px',
            textAlign: 'center',
            display: 'inline-block',
            color: 'grey'
        };
        const titleStyle = {
            cursor: 'pointer',
            userSelect: 'none',
            borderTop: '1px solid grey',
            background: 'rgba(255, 255, 255, 0.1)',
            color: isExpanded ? 'rgb(150, 150, 255)' : 'rgb(200, 200, 255)',
            marginBottom: isExpanded ? 0 : 10
        };
        if (isExpanded) {
            return <div key={version.tag} style={{marginBottom: 14}}>
                <div onClick={toggle} style={titleStyle}>
                    <b style={expanderStyle}>-</b><TagIcon/>{version.tag}
                    <VersionTitle version={version}/>
                    <VersionDate date={version.date}/>
                </div>
                <div style={{paddingLeft: 24, paddingTop: 8, fontSize: '18px'}}>
                    {map(version.changes, group => this.renderChangeGroup(group))}
                </div>
            </div>;
        }
        return <div key={version.tag} onClick={toggle} style={titleStyle}>
            <b style={expanderStyle}>+</b><TagIcon/>{version.tag}
            <VersionTitle version={version}/>
            <VersionDate date={version.date}/>
        </div>;
    }

    renderChangeGroup(group, level = 0) {
        const titleStyle = {
            marginBottom: 8,
            fontSize: 18 - (level * 2),
            textDecoration: level === 0 ? 'underline' : 'none'
        };

        return <div key={group.name} style={{marginBottom: 12}}>
            <div style={titleStyle}>{group.name}</div>
            <div style={{paddingLeft: 24}}>
                {map(group.issues, (issue, idx) => <Issue key={idx} issue={issue}/>)}
            </div>
            {group.groups ? <div style={{paddingLeft: 24, paddingTop: 12}}>
                {map(group.groups, gp => this.renderChangeGroup(gp, level + 1))}
            </div> : null}
        </div>;
    }
}

const issueStyle = {
    fontSize: '14px',
    textIndent: '-24px',
    marginLeft: '24px',
    lineHeight: '24px',
    color: 'rgb(210, 210, 210)'
};

const issueCache = {};

class Issue extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.parse();
    }

    parse() {
        let type = 'simple';
        let id;
        let tag;
        let state;
        let isBug;
        let text = this.props.issue;
        const mTags = this.props.issue.match(/\(([a-zA-Z0-9]+)\)(.*)/);
        if (mTags) {
            const num = Number(mTags[1]);
            let baseText = mTags[2].match(/ *(.*)/)[1];
            if (baseText) {
                const mBug = baseText.match(/BUG +(.*)/);
                if (mBug) {
                    isBug = true;
                    baseText = mBug[1];
                }
            }
            if (!Number.isNaN(num)) {
                id = num;
                text = <i>Loading issue... #{id}</i>;
                type = 'github';
                if (id in issueCache) {
                    const info = issueCache[id];
                    text = baseText || info.title;
                    state = info.state;
                    tag = this.findTag(info);
                    isBug = isBug || map(info.labels, l => l.name).indexOf('[a] BUG') !== -1;
                } else {
                    this.fetchGithubIssue(id, baseText);
                }
            } else {
                text = baseText;
                tag = mTags[1];
            }
        }

        if (type !== 'github') {
            const mBug = text.match(/BUG +(.*)/);
            if (mBug) {
                isBug = true;
                text = mBug[1];
            }
        }

        return {type, id, isBug, tag, text, state};
    }

    fetchGithubIssue(id, text) {
        const that = this;
        const request = new XMLHttpRequest();
        request.open('GET', `${BASE_API_URL}/issues/${id}`, true);

        request.onload = function onload() {
            if (this.status === 200) {
                try {
                    const info = JSON.parse(request.response);
                    issueCache[id] = info;
                    that.setState({
                        text: text || info.title,
                        state: info.state,
                        tag: that.findTag(info),
                        isBug: that.state.isBug || map(info.labels, l => l.name).indexOf('[a] BUG') !== -1
                    });
                } catch (e) {
                    // continue regardless of error
                }
            }
        };

        request.send(null);
    }

    findTag(info) {
        const rawLabels = filter(info.labels, ({name}) => name.substr(0, 4) === '[t] ');
        const labels = map(rawLabels, ({name}) => name.substr(4));
        return labels.join(' | ');
    }

    render() {
        const {type, text, id, state, tag, isBug} = this.state;
        const closed = state === 'closed';
        const iconStyle = {
            width: 16,
            height: 16
        };
        const linkStyle = {
            color: 'white',
            textDecoration: 'none'
        };
        let imgUrl = './images/issue.png';
        if (type === 'github') {
            imgUrl = `./images/${closed ? 'github_closed' : 'github'}.png`;
        }
        const tagStyle = {
            background: '#bfd4f2',
            color: 'black',
            marginRight: '8px',
            borderRadius: '3px',
            border: '1px solid white',
            padding: '0 3px'
        };
        const bugStyle = {
            background: '#b60205',
            color: 'black',
            marginRight: '8px',
            borderRadius: '3px',
            padding: '0 3px'
        };
        return <div style={issueStyle}>
            {type === 'github' ? <a
                href={`${BASE_URL}/issues/${id}`}
                style={linkStyle}
                target="_blank"
            >
                <img src={imgUrl} style={iconStyle}/>
                &nbsp;
                <span style={{fontSize: 12, border: '1px solid white', padding: '0 5px'}}>{id}</span>
                &nbsp;
            </a> : <span><img src={imgUrl} style={iconStyle}/>&nbsp;</span>}
            {isBug && <span style={bugStyle}>BUG</span>}
            {tag && <span style={tagStyle}>{tag}</span>}
            {text}
        </div>;
    }
}
