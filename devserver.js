'use strict';

const fs = require('fs');
const http = require('http');
const React = require('react');
const jsx = require('node-jsx');
jsx.install();
const {renderToStaticMarkup} = require('react-dom/server');
const express = require('express');
const bodyParser = require('body-parser');
const createWebpackMiddleware = require('webpack-express-middleware');
const app = express();
const config = require('./webpack.config.js');
config.devtool = process.env.SRCMAP === 'true' ? 'source-map' : undefined;
const compiler = require('webpack')(config);
const Main = require('./main.jsx');

app.set('port', process.env.PORT || 8080);
app.set('host', process.env.HOST || '0.0.0.0');

app.use(bodyParser.json());

app.post('/metadata', function (req, res) {
    const body = req.body;
    console.log(`Saving metadata, content=${JSON.stringify(body, null, 2)}`);
    let fileName;
    switch (body.type) {
        case 'scene':
            fileName = `./www/metadata/scene_${body.index}.json`;
            break;
        case 'game':
            fileName = './www/metadata/game.json';
            break;
    }
    if (fileName) {
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
    res.end();
});

app.post('/ws/crash/report', function (req, res) {
    console.log('Saving crash report');
    const report = req.body;
    fs.writeFile('./crash_report.json', JSON.stringify(report, null, 2), () => {});
    const content = JSON.stringify(report);
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
    res.end();
});

app.use('/data', express.static('./www/data', {
    fallthrough: true
}));

app.use('/data', (req, res) => {
    console.log(`404 ${req.method} ./www/data${req.url}`);
    res.status(404).send();
});

const indexBody = renderToStaticMarkup(React.createElement(Main));

app.get('/', (req, res) => {
    res.end(indexBody);
});

const webpackMiddleware = createWebpackMiddleware(compiler, config);
webpackMiddleware(app);

app.listen(app.get('port'), app.get('host'), webpackMiddleware.listen);
