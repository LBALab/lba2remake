'use strict';

const fs = require('fs');
const express = require('express');
const createWebpackMiddleware = require('webpack-express-middleware');
const app = express();
const config = require('./webpack.config.js');
config.devtool = process.env.SRCMAP === 'true' ? 'source-map' : undefined;
const compiler = require('webpack')(config);

app.set('port', process.env.PORT || 8080);
app.set('host', process.env.HOST || '0.0.0.0');

app.post('/metadata/scene/:sceneId', function (req, res) {
    console.log('saving scene metadata, scene=', req.params.sceneId);
    const ws = fs.createWriteStream(`./www/metadata/scene_${req.params.sceneId}.json`);
    req.pipe(ws);
    res.end();
});

app.post('/metadata/game', function (req, res) {
    console.log('saving game metadata');
    const ws = fs.createWriteStream('./www/metadata/game.json');
    req.pipe(ws);
    res.end();
});

const webpackMiddleware = createWebpackMiddleware(compiler, config);
webpackMiddleware(app);

app.listen(app.get('port'), app.get('host'), webpackMiddleware.listen);
