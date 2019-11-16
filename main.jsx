const React = require('react');

module.exports = ({script, buildNumber}) => (<html lang="en">
    <head>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-touch-fullscreen" content="yes"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <link rel="manifest" href="manifest.json"/>
        <link rel="stylesheet" href="layout.css"/>
        <title>LBA2</title>
        {buildNumber && <script dangerouslySetInnerHTML={{__html: `window.buildNumber=${buildNumber};`}} />}
        <script dangerouslySetInnerHTML={{__html: script || 'window.ga=function(){}'}} />
    </head>
    <body>
        <div id="preload" className="loader">
            <div className="lds-roller">
                <div className="n1"/>
                <div className="n2"/>
                <div className="n3"/>
                <div className="n4"/>
                <div className="n5"/>
                <div className="n6"/>
            </div>
            <div className="lds-roller-text">
                <span className="lds-title">Loading</span><br/>
                <span className="lds-subtext">Game Engine</span>
            </div>
        </div>
        <div id="root"/>
        <script type="text/javascript" src="bundle.js"/>
    </body>
</html>);
