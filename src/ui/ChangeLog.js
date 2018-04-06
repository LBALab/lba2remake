/* eslint-disable react/no-multi-comp */
import React from 'react';
import {map} from 'lodash';
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

function TagIcon() {
    return <img src="./images/label.png" style={{width: 16, height: 16, paddingRight: 4}}/>;
}

/**
 * @return {null}
 */
function VersionDate({date}) {
    if (date) {
        return <span style={{float: 'right', fontSize: 14}}>{date}</span>;
    }
    return <span style={{float: 'right', fontSize: 14, fontStyle: 'italic'}}>Unreleased</span>;
}

function VersionTitle({version}) {
    const isCurrent = version.tag === currentVersion;
    let currentText;
    let title;
    if (isCurrent) {
        currentText = <span style={{fontSize: 14, color: 'rgb(255, 100, 100)'}}>&nbsp;(current version)</span>;
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
        return <div style={bg_style}>
            <div style={inner_style}>
                <div style={content_style}>
                    <div style={{fontSize: 26, textDecoration: 'underline'}}>LBA2 Remake</div>
                    <div style={{paddingBottom: 20}}>Changelog</div>
                    <div>
                        {map(versions, this.renderVersion)}
                    </div>
                </div>
            </div>
        </div>;
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
            color: isExpanded ? 'rgb(200, 200, 255)' : 'rgb(200, 200, 200)',
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
                    {map(version.changes, group =>
                        this.renderChangeGroup(group, version.tag, expanded))}
                </div>
            </div>;
        }
        return <div key={version.tag} onClick={toggle} style={titleStyle}>
            <b style={expanderStyle}>+</b><TagIcon/>{version.tag}
            <VersionTitle version={version}/>
            <VersionDate date={version.date}/>
        </div>;
    }

    renderChangeGroup(group) {
        const descrStyle = {
            fontSize: 14,
            color: 'rgb(200, 200, 255)',
            paddingLeft: 12,
            marginBottom: group.description ? 8 : 0
        };

        return <div key={group.name} style={{marginBottom: 12}}>
            <div style={{marginBottom: 8}}>
                <u>{group.name}</u>
                <span style={descrStyle}>{group.description}</span>
            </div>
            <div style={{paddingLeft: 24}}>
                {map(group.issues, (issue, idx) => <Issue key={idx} issue={issue}/>)}
            </div>
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
        const m = this.props.issue.match(/\(([a-zA-Z0-9]+)\)(.*)/);
        if (m) {
            const id = Number(m[1]);
            if (!Number.isNaN(id)) {
                let text = <i>Loading issue... #{id}</i>;
                let state;
                if (id in issueCache) {
                    text = m[2] || issueCache[id].title;
                    state = issueCache[id].state;
                } else {
                    this.fetchGithubIssue(id, m[2]);
                }
                return {type: 'github', text, id, state};
            }
            return {text: m[2], tag: m[1]};
        }
        return {text: this.props.issue};
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
                    that.setState({text: text || info.title, state: info.state});
                } catch (e) {
                    // continue regardless of error
                }
            }
        };

        request.send(null);
    }

    render() {
        const {type, text, id, state} = this.state;
        const closed = state === 'closed';
        const iconStyle = {
            width: 16,
            height: 16
        };
        const linkStyle = {
            color: 'rgb(160, 160, 255)',
            textDecoration: 'none'
        };
        let imgUrl = './images/issue.png';
        if (type === 'github') {
            imgUrl = `./images/${closed ? 'github_closed' : 'github'}.png`;
        }
        return <div style={issueStyle}>
            {type === 'github' ? <a href={`${BASE_URL}/issues/${id}`} style={linkStyle}>
                <img src={imgUrl} style={iconStyle}/>
                &nbsp;
                <span>#{id}</span>
                &nbsp;
            </a> : <span><img src={imgUrl} style={iconStyle}/>&nbsp;</span>}
            {text}
        </div>;
    }
}
