'use strict';

const express = require('express');
const createWebpackMiddleware = require('webpack-express-middleware');
const app = express();
const config = require('./webpack.config.js');
const compiler = require('webpack')(config);

app.set('port', process.env.PORT || 8080);
app.set('host', process.env.HOST || '0.0.0.0');

app.post('/metadata/scene/:sceneId', function (req, res) {
    console.log('saving scene metadata, scene=', req.params.sceneId);
    res.end();
});

const webpackMiddleware = createWebpackMiddleware(compiler, config);
webpackMiddleware(app);

app.listen(app.get('port'), app.get('host'), webpackMiddleware.listen);
