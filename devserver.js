'use strict';

const {omit, clone, map} = require('lodash');
const https = require('https');
const React = require('react');
const jsx = require('node-jsx');
jsx.install();
const {renderToStaticMarkup} = require('react-dom/server');
const express = require('express');
const createWebpackMiddleware = require('webpack-express-middleware');
const app = express();
const config = require('./webpack.config.js');
config.devtool = process.env.SRCMAP === 'true' ? 'source-map' : undefined;
const compiler = require('webpack')(config);
const Main = require('./main.jsx');

app.set('port', process.env.PORT || 8080);
app.set('host', process.env.HOST || '0.0.0.0');

const proxyToPublicServer = (basePath, req, res) => {
    const queryString = map(req.query, (value, name) => `${name}=${encodeURIComponent(value)}`).join('&');
    const tgtReq = https.request({
        host: 'www.lba2remake.net',
        path: `${basePath}${req.path}${queryString ? `?${queryString}` : ''}`,
        method: req.method,
        headers: omit(req.headers, 'host')
    }, (tgtRes) => {
        res.writeHead(tgtRes.statusCode, tgtRes.statusMessage, clone(tgtRes.headers));
        tgtRes.pipe(res);
    });
    req.pipe(tgtReq);

};

app.use('/metadata', proxyToPublicServer.bind(null, '/metadata'));
app.use('/crash', proxyToPublicServer.bind(null, '/crash'));

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
