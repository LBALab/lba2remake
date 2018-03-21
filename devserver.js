'use strict';

const fs = require('fs');
const http = require('http');
const express = require('express');
const createWebpackMiddleware = require('webpack-express-middleware');
const app = express();
const config = require('./webpack.config.js');
config.devtool = process.env.SRCMAP === 'true' ? 'source-map' : undefined;
const compiler = require('webpack')(config);

app.set('port', process.env.PORT || 8080);
app.set('host', process.env.HOST || '0.0.0.0');

app.post('/ws/metadata/scene/:sceneId', function (req, res) {
    console.log(`saving scene metadata, scene=${req.params.sceneId}, author=${req.query.author}`);
    const ws = fs.createWriteStream(`./www/metadata/scene_${req.params.sceneId}.json`);
    req.pipe(ws);
    res.end();
});

app.post('/ws/metadata/game', function (req, res) {
    console.log(`saving game metadata, author=${req.query.author}`);
    const ws = fs.createWriteStream('./www/metadata/game.json');
    req.pipe(ws);
    res.end();
});

app.post('/ws/crash/report', function (req, res) {
    console.log('saving crash report');
    const ws = fs.createWriteStream('./crash_report.json');
    req.pipe(ws);
    res.end();
    if (process.env.SRCMAP) {
        let body = '';
        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            const report = JSON.parse(body);
            report.version += ' (modified)';
            const content = JSON.stringify(report, null, 2);
            const tgtReq = http.request({
                host: 'lba2remake.xesf.net',
                path: '/ws/crash/report',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': content.length
                }
            });
            tgtReq.write(content);
            tgtReq.end();
        });
    }
});

const webpackMiddleware = createWebpackMiddleware(compiler, config);
webpackMiddleware(app);

app.listen(app.get('port'), app.get('host'), webpackMiddleware.listen);
