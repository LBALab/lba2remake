'use strict';

require('@babel/register')({
    presets: ['@babel/preset-env', '@babel/preset-react']
});

const { config } = require('dotenv');

config({ path: `${process.cwd()}/.env` });

if (!('BLENDER_EXEC_PATH' in process.env))
    console.warn('BLENDER_EXEC_PATH not set in .env file');

if (!('BAKED_MODELS_PATH' in process.env))
    console.warn('BAKED_MODELS_PATH not set in .env file');

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
const apiRouter = require('./api');

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
    });
});

app.get('/layout_models/:game', function(req, res) {
    const game = req.params.game;
    fs.readdir(`./www/models/${game}/layouts`, (err, files) => {
        res.end(JSON.stringify(files));
    });
});

app.use('/api', apiRouter);

app.use('/', express.static('./www'));
app.use('/doc', express.static('./doc'));
app.use('/baked_models', express.static(process.env.BAKED_MODELS_PATH));
app.use('/webxr-assets', express.static('./node_modules/@webxr-input-profiles/assets/dist/profiles'));
app.use('/xatlas-web.js', express.static('./node_modules/@agrande/xatlas-web/dist/xatlas-web.js'));
app.use('/xatlas-web.wasm', express.static('./node_modules/@agrande/xatlas-web/dist/xatlas-web.wasm'));
app.use('/xatlas-worker.js', express.static('./src/graphics/baking/xatlas/worker.js'));
app.use('/three.js', express.static('./node_modules/three/build/three.min.js'));

const indexBody = renderToStaticMarkup(React.createElement(Main, {
    script: 'window.ga=function(){};\nwindow.isLocalServer=true;',
    crashReportUrl: '/crash'
}));

app.get('/', (req, res) => {
    res.end(indexBody);
});

webpackConfig.devtool = process.env.SRCMAP === 'true' ? 'source-map' : undefined;
const compiler = webpack(webpackConfig);
app.use(middleware(compiler));

app.listen(app.get('port'), app.get('host'));
