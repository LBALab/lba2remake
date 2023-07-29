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
    limit: '64mb'
}));

app.post('/metadata/:game', function (req, res) {
    const body = req.body;
    const game = req.params.game;
    console.log(`Saving metadata, type=${body.type}`);
    let fileName;
    let kind = 'partial';
    switch (body.type) {
        case 'scene':
            fileName = `./www/metadata/${game}/scene_${body.index}.json`;
            break;
        case 'game':
            fileName = `./www/metadata/${game}/game.json`;
            break;
        case 'models':
            fileName = `./www/metadata/${game}/models.json`;
            break;
        case 'islands':
            fileName = `./www/metadata/${game}/islands.json`;
            break;
        case 'layouts':
            fileName = `./www/metadata/${game}/layouts.json`;
            kind = 'full';
            break;
    }
    if (fileName) {
        if (kind === 'full') {
            fs.writeFile(fileName, JSON.stringify(body.content, null, 2), () => {});
        } else {
            fs.readFile(fileName, 'utf8', (err, file) => {
                if (err) {
                    console.error(err);
                } else {
                    const content = JSON.parse(file);
                    if (!(body.subType in content)) {
                        content[body.subType] = [];
                    }
                    content[body.subType][body.subIndex] = body.value;
                    fs.writeFile(fileName, JSON.stringify(content, null, 2), () => {});
                }
            });
        }
    }
    res.end();
});

app.post('/crash', function (req, res) {
    console.log('Saving crash report');
    const report = req.body;
    fs.writeFile('./crash_report.json', JSON.stringify(report, null, 2), () => {});
    res.end();
});

app.post('/lut.dat', function(req, res) {
    fs.writeFile('./www/lut.dat', req.body, () => {
        console.log('Saved lut.dat');
        res.end();
    });
});

app.post('/grid_metadata/:game', function(req, res) {
    const game = req.params.game;
    fs.writeFile(`./www/metadata/${game}/grids.json`, req.body, () => {
        console.log(`Saved metadata/${game}/grids.json`);
        res.end();
    });
});

app.post('/iso_replacements/:game/:entry', function(req, res) {
    const entry = Number(req.params.entry);
    const game = req.params.game;
    fs.writeFile(`./www/models/${game}/iso_scenes/${entry}.glb`, req.body, () => {
        console.log(`Saved models/${game}/iso_scenes/${entry}.glb`);
        res.end();
        fs.readFile(`./www/metadata/${game}/iso_scenes.json`, 'utf8', (err, file) => {
            if (err) {
                console.error(err);
            } else {
                const content = JSON.parse(file);
                if (!content.includes(entry)) {
                    content.push(entry);
                    fs.writeFile(`./www/metadata/${game}/iso_scenes.json`, JSON.stringify(content, null, 2), () => {
                        console.log('Saved iso_scenes metadata');
                    });
                }
            }
        });
    });
});

app.get('/layout_models/:game', function(req, res) {
    const game = req.params.game;
    fs.readdir(`./www/models/${game}/layouts`, (err, files) => {
        res.end(JSON.stringify(files));
    });
});

app.use('/', express.static('./www'));
app.use('/doc', express.static('./doc'));
app.use('/webxr-assets', express.static('./node_modules/@webxr-input-profiles/assets/dist/profiles'));

const indexBody = renderToStaticMarkup(React.createElement(Main, {
    scriptTag: '',
    script: 'window.gtag=function(){};\nwindow.isLocalServer=true;',
    crashReportUrl: '/crash'
}));

app.get('/', (req, res) => {
    res.end(indexBody);
});

webpackConfig.devtool = process.env.SRCMAP === 'true' ? 'source-map' : undefined;
const compiler = webpack(webpackConfig);
app.use(middleware(compiler));

app.listen(app.get('port'), app.get('host'));
