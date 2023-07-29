'use strict';

require('@babel/register')({
    presets: ['@babel/preset-env', '@babel/preset-react']
});

const fs = require('fs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Main = require(`../main.jsx`);
const config = require('../.build-config.js');

const analytics = config.googleAnalyticsProperty;
const gtagScript = analytics && `https://www.googletagmanager.com/gtag/js?id=${analytics}`;
const gaScript = analytics && `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${analytics}');window.ga=gtag;`;

const indexBody = renderToStaticMarkup(React.createElement(Main, {
    scriptTag: gtagScript,
    script: gaScript,
    crashReportUrl: '.netlify/functions/crash-report',
}));

fs.writeFileSync('./www/index.html', indexBody);
