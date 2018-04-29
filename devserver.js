'use strict';

const {omit, clone, map} = require('lodash');
const https = require('https');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const express = require('express');
const middleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config.js');
const webpack = require('webpack');
require('node-jsx').install();
const Main = require('./main.jsx');

const app = express();

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

app.use('/', express.static('./www'));

const indexBody = renderToStaticMarkup(React.createElement(Main));

app.get('/', (req, res) => {
    res.end(indexBody);
});

webpackConfig.devtool = process.env.SRCMAP === 'true' ? 'source-map' : undefined;
const compiler = webpack(webpackConfig);
app.use(middleware(compiler));

app.listen(app.get('port'), app.get('host'));
