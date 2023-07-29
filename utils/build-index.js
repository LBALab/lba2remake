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
const gaScript = analytics && `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create','${analytics}','auto');ga('send','pageview');`;

const indexBody = renderToStaticMarkup(React.createElement(Main, {
    script: gaScript,
    crashReportUrl: '.netlify/functions/crash-report',
}));

fs.writeFileSync('./www/index.html', indexBody);
