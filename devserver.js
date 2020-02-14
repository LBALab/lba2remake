'use strict';

require('@babel/register')({
    presets: ['@babel/preset-env', '@babel/preset-react']
});

const fs = require('fs');
const http = require('http');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const express = require('express');
const middleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config.js');
const webpack = require('webpack');
const bodyParser = require('body-parser');
const Main = require('./main.jsx');

const app = express();

app.set('port', process.env.PORT || 8080);
app.set('host', process.env.HOST || '0.0.0.0');

app.use(bodyParser.json());
app.use(bodyParser.raw({
    limit: '2mb'
}));

app.post('/metadata', function (req, res) { // lgtm [js/missing-rate-limiting]
    const body = req.body;
    console.log(`Saving metadata, type=${body.type}`);
    let fileName;
    let kind = 'partial';
    switch (body.type) {
        case 'scene':
            fileName = `./www/metadata/scene_${body.index}.json`;
            break;
        case 'game':
            fileName = './www/metadata/game.json';
            break;
        case 'models':
            fileName = './www/metadata/models.json';
            break;
        case 'islands':
            fileName = './www/metadata/islands.json';
            break;
        case 'layouts':
            fileName = './www/metadata/layouts.json';
            kind = 'full';
            break;
    }
    if (fileName) {
        if (kind === 'full') {
            fs.writeFile(fileName, JSON.stringify(body.content, null, 2), () => {}); // lgtm [js/path-injection]
        } else {
            fs.readFile(fileName, 'utf8', (err, file) => { // lgtm [js/path-injection]
                if (err) {
                    console.error(err);
                } else {
                    const content = JSON.parse(file);
                    if (!(body.subType in content)) {
                        content[body.subType] = [];
                    }
                    content[body.subType][body.subIndex] = body.value;
                    fs.writeFile(fileName, JSON.stringify(content, null, 2), () => {}); // lgtm [js/path-injection]
                }
            });
        }
    }
    res.end();
});

app.post('/crash', function (req, res) { // lgtm [js/missing-rate-limiting]
    console.log('Saving crash report');
    const report = req.body;
    fs.writeFile('./crash_report.json', JSON.stringify(report, null, 2), () => {});
    const content = JSON.stringify(report);
    const tgtReq = http.request({
        host: 'www.lba2remake.net',
        path: '/ws/crash/report',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': content.length
        }
    });
    tgtReq.write(content);
    tgtReq.end();
    res.end();
});

app.post('/lut.dat', function(req, res) { // lgtm [js/missing-rate-limiting]
    fs.writeFile('./www/lut.dat', req.body, () => {
        console.log('Saved lut.dat');
        res.end();
    });
});

app.get('/layout_models', function(req, res) {
    fs.readdir('./www/models/layouts', (err, files) => {
        res.end(JSON.stringify(files));
      });
});

app.use('/', express.static('./www'));
app.use('/doc', express.static('./doc'));

const indexBody = renderToStaticMarkup(React.createElement(Main, {
    script: 'window.ga=function(){};\nwindow.isLocalServer=true;'
}));

app.get('/', (req, res) => {
    res.end(indexBody);
});

webpackConfig.devtool = process.env.SRCMAP === 'true' ? 'source-map' : undefined;
const compiler = webpack(webpackConfig);
app.use(middleware(compiler));

app.listen(app.get('port'), app.get('host'));
