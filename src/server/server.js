import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../../webpack.config.dev';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import bodyParser from 'body-parser';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import compression from 'compression';

import React from 'react';
import ReactDOM from 'react-dom/server';
import { createMemoryHistory, RouterContext, match } from 'react-router';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { trigger } from 'redial';
import { callAPIMiddleware } from '../middleware/callAPIMiddleware';
import { StyleSheetServer } from 'aphrodite';
import { configureStore } from '../store';
import Helm from 'react-helmet'; // because we are already using helmet
import reducer from '../createReducer';
import createRoutes from '../routes/root';

const isDeveloping = process.env.NODE_ENV == 'development';
const port = process.env.PORT || 5000;
const server = global.server = express();

// Security
server.disable('x-powered-by');
server.set('port', port);
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(hpp());
server.use(helmet.contentSecurityPolicy({
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'"],
  imgSrc: ["'self'"],
  connectSrc: ["'self'", 'ws:'],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'none'"],
  frameSrc: ["'none'"],
}));
server.use(helmet.xssFilter());
server.use(helmet.frameguard('deny'));
server.use(helmet.ieNoOpen());
server.use(helmet.noSniff());
server.use(cookieParser());
server.use(compression());

// API
server.use('/api/v0/posts', require('./api/posts'));
server.use('/api/v0/post', require('./api/post'));

// Stub for assets, in case running in dev mode.
let assets;

// Webpack (for development)
if (isDeveloping) {
  server.use(morgan('dev'));
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: true,
      modules: false,
    },

  });
  server.use(middleware);

  server.use(webpackHotMiddleware(compiler, {
    log: console.log,
  }));
} else {
  assets = require('../../assets.json');
  server.use(morgan('combined'));
  server.use('/build/static', express.static('./build/static'));
}

// Proxy adpage.html, this is so that serving ads work when developing localy
server.use('/_uac/adpage.html', helmet.frameguard(), proxy('o.aolcdn.com', {
  forwardPath: (req, res) => {
    return '/os/_uac/adpage.html';
  }
}));

// Render Document (include global styles)
const renderFullPage = (data, initialState, assets) => {
  const head = Helm.rewind();

  // Included are some solid resets. Feel free to add normalize etc.
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
         ${head.title.toString()}
         <meta name="viewport" content="width=device-width, initial-scale=1" />
         ${head.meta.toString()}
         ${head.link.toString()}
         <style>

           html {
             box-sizing: border-box;
           }

           *,
           *::before,
           *::after {
             box-sizing: border-box;
           }

           @at-root {
             @-moz-viewport      { width: device-width; }
             @-ms-viewport       { width: device-width; }
             @-o-viewport        { width: device-width; }
             @-webkit-viewport   { width: device-width; }
             @viewport           { width: device-width; }
           }

           html {
           	font-size: 100%;
           	-ms-overflow-style: scrollbar;
           	-webkit-tap-highlight-color: rgba(0,0,0,0);
           	height: 100%;
           }

           body {
            margin: 0px;
           	font-size: 1rem;
            background-color: #fff;
           	color: #555;
           	-webkit-font-smoothing: antialiased;
             -moz-osx-font-smoothing: grayscale;
           	font-family: -apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,Arial,sans-serif;
           }

           body,html{width:100%;height:100%;overflow: hidden;}

           [tabindex="-1"]:focus {
             outline: none !important;
           }

           /* Typography */

           h1, h2, h3, h4, h5, h6 {
             margin: 0;
             letter-spacing: -0.03em;
             font-weight: bold;
           }

           p {
             margin: 0;
           }

           abbr[title],
           abbr[data-original-title] {
             cursor: help;
             border-bottom: 1px dotted #eee;
           }

           address {
             margin-bottom: 1rem;
             font-style: normal;
             line-height: inherit;
           }

           ol,
           ul,
           dl {
             margin-top: 0;
             margin-bottom: 1rem;
           }

           ol ol,
           ul ul,
           ol ul,
           ul ol {
             margin-bottom: 0;
           }

           dt {
             font-weight: bold;
           }

           dd {
             margin-bottom: .5rem;
             margin-left: 0;
           }

           blockquote {
             margin: 0 0 1rem;
           }

           /* Links */
           a,
           a:hover,
           a:focus {
           	text-decoration: none;
           }


           /* Code */
           pre {
             margin: 0;
             /*margin-bottom: 1rem;*/
           }
           /* Figures & Images */
           figure {
             margin: 0 0 1rem;
           }

           img {
           	vertical-align: middle;
           }

           [role="button"] {
             cursor: pointer;
           }

           a,
           area,
           button,
           [role="button"],
           input,
           label,
           select,
           summary,
           textarea {
             touch-action: manipulation;
           }

           /* Forms */

           label {
           	display: inline-block;
           	margin-bottom: .5rem;
           }

           button:focus {
             outline: 1px dotted;
             outline: 5px auto -webkit-focus-ring-color;
           }

           input,
           button,
           select,
           textarea {
             margin: 0;
             line-height: inherit;
             border-radius: 0;
           }

           textarea {
             resize: vertical;
           }

           fieldset {
             min-width: 0;
             padding: 0;
             margin: 0;
             border: 0;
           }

           legend {
             display: block;
             width: 100%;
             padding: 0;
             margin-bottom: .5rem;
             font-size: 1.5rem;
             line-height: inherit;
           }

           input[type="search"],
           input[type="text"],
           textarea {
             box-sizing: inherit;
             -webkit-appearance: none;
           }

           [hidden] {
             display: none !important;
           }

           body,
           button,
           input,
           textarea {
             font-family: font-family: 'Helvetica Neue', Helvetica, sans-serif;;
           }

           a,a:visited {
             text-decoration: none;
           }
         </style>
         <style data-aphrodite>${data.css.content}</style>
      </head>
      <body>
        <div id="root" style="width: 100%; height: 100%;">${data.html}</div>
        <script>window.renderedClassNames = ${JSON.stringify(data.css.renderedClassNames)};</script>
        <script>window.INITIAL_STATE = ${JSON.stringify(initialState)};</script>

        <script>
          window.NREUM||(NREUM={}),__nr_require=function(t,e,n){function r(n){if(!e[n]){var o=e[n]={exports:{}};t[n][0].call(o.exports,function(e){var o=t[n][1][e];return r(o?o:e)},o,o.exports)}return e[n].exports}if("function"==typeof __nr_require)return __nr_require;for(var o=0;o<n.length;o++)r(n[o]);return r}({QJf3ax:[function(t,e){function n(t){function e(e,n,a){t&&t(e,n,a),a||(a={});for(var c=s(e),f=c.length,u=i(a,o,r),d=0;f>d;d++)c[d].apply(u,n);return u}function a(t,e){f[t]=s(t).concat(e)}function s(t){return f[t]||[]}function c(){return n(e)}var f={};return{on:a,emit:e,create:c,listeners:s,_events:f}}function r(){return{}}var o="nr@context",i=t("gos");e.exports=n()},{gos:"7eSDFh"}],ee:[function(t,e){e.exports=t("QJf3ax")},{}],3:[function(t){function e(t){try{i.console&&console.log(t)}catch(e){}}var n,r=t("ee"),o=t(1),i={};try{n=localStorage.getItem("__nr_flags").split(","),console&&"function"==typeof console.log&&(i.console=!0,-1!==n.indexOf("dev")&&(i.dev=!0),-1!==n.indexOf("nr_dev")&&(i.nrDev=!0))}catch(a){}i.nrDev&&r.on("internal-error",function(t){e(t.stack)}),i.dev&&r.on("fn-err",function(t,n,r){e(r.stack)}),i.dev&&(e("NR AGENT IN DEVELOPMENT MODE"),e("flags: "+o(i,function(t){return t}).join(", ")))},{1:22,ee:"QJf3ax"}],4:[function(t){function e(t,e,n,i,s){try{c?c-=1:r("err",[s||new UncaughtException(t,e,n)])}catch(f){try{r("ierr",[f,(new Date).getTime(),!0])}catch(u){}}return"function"==typeof a?a.apply(this,o(arguments)):!1}function UncaughtException(t,e,n){this.message=t||"Uncaught error with no additional information",this.sourceURL=e,this.line=n}function n(t){r("err",[t,(new Date).getTime()])}var r=t("handle"),o=t(6),i=t("ee"),a=window.onerror,s=!1,c=0;t("loader").features.err=!0,t(5),window.onerror=e;try{throw new Error}catch(f){"stack"in f&&(t(1),t(2),"addEventListener"in window&&t(3),window.XMLHttpRequest&&XMLHttpRequest.prototype&&XMLHttpRequest.prototype.addEventListener&&window.XMLHttpRequest&&XMLHttpRequest.prototype&&XMLHttpRequest.prototype.addEventListener&&!/CriOS/.test(navigator.userAgent)&&t(4),s=!0)}i.on("fn-start",function(){s&&(c+=1)}),i.on("fn-err",function(t,e,r){s&&(this.thrown=!0,n(r))}),i.on("fn-end",function(){s&&!this.thrown&&c>0&&(c-=1)}),i.on("internal-error",function(t){r("ierr",[t,(new Date).getTime(),!0])})},{1:9,2:8,3:6,4:10,5:3,6:23,ee:"QJf3ax",handle:"D5DuLP",loader:"G9z0Bl"}],5:[function(t){function e(){}if(window.performance&&window.performance.timing&&window.performance.getEntriesByType){var n=t("ee"),r=t("handle"),o=t(1),i=t(2);t("loader").features.stn=!0,t(3),n.on("fn-start",function(t){var e=t[0];e instanceof Event&&(this.bstStart=Date.now())}),n.on("fn-end",function(t,e){var n=t[0];n instanceof Event&&r("bst",[n,e,this.bstStart,Date.now()])}),o.on("fn-start",function(t,e,n){this.bstStart=Date.now(),this.bstType=n}),o.on("fn-end",function(t,e){r("bstTimer",[e,this.bstStart,Date.now(),this.bstType])}),i.on("fn-start",function(){this.bstStart=Date.now()}),i.on("fn-end",function(t,e){r("bstTimer",[e,this.bstStart,Date.now(),"requestAnimationFrame"])}),n.on("pushState-start",function(){this.time=Date.now(),this.startPath=location.pathname+location.hash}),n.on("pushState-end",function(){r("bstHist",[location.pathname+location.hash,this.startPath,this.time])}),"addEventListener"in window.performance&&(window.performance.addEventListener("webkitresourcetimingbufferfull",function(){r("bstResource",[window.performance.getEntriesByType("resource")]),window.performance.clearResourceTimings()},!1),window.performance.addEventListener("resourcetimingbufferfull",function(){r("bstResource",[window.performance.getEntriesByType("resource")]),window.performance.clearResourceTimings()},!1)),document.addEventListener("scroll",e,!1),document.addEventListener("keypress",e,!1),document.addEventListener("click",e,!1)}},{1:9,2:8,3:7,ee:"QJf3ax",handle:"D5DuLP",loader:"G9z0Bl"}],6:[function(t,e){function n(t){i.inPlace(t,["addEventListener","removeEventListener"],"-",r)}function r(t){return t[1]}var o=t("ee").create(),i=t(1)(o),a=t("gos");if(e.exports=o,n(window),"getPrototypeOf"in Object){for(var s=document;s&&!s.hasOwnProperty("addEventListener");)s=Object.getPrototypeOf(s);s&&n(s);for(var c=XMLHttpRequest.prototype;c&&!c.hasOwnProperty("addEventListener");)c=Object.getPrototypeOf(c);c&&n(c)}else XMLHttpRequest.prototype.hasOwnProperty("addEventListener")&&n(XMLHttpRequest.prototype);o.on("addEventListener-start",function(t){if(t[1]){var e=t[1];"function"==typeof e?this.wrapped=t[1]=a(e,"nr@wrapped",function(){return i(e,"fn-",null,e.name||"anonymous")}):"function"==typeof e.handleEvent&&i.inPlace(e,["handleEvent"],"fn-")}}),o.on("removeEventListener-start",function(t){var e=this.wrapped;e&&(t[1]=e)})},{1:24,ee:"QJf3ax",gos:"7eSDFh"}],7:[function(t,e){var n=t("ee").create(),r=t(1)(n);e.exports=n,r.inPlace(window.history,["pushState"],"-")},{1:24,ee:"QJf3ax"}],8:[function(t,e){var n=t("ee").create(),r=t(1)(n);e.exports=n,r.inPlace(window,["requestAnimationFrame","mozRequestAnimationFrame","webkitRequestAnimationFrame","msRequestAnimationFrame"],"raf-"),n.on("raf-start",function(t){t[0]=r(t[0],"fn-")})},{1:24,ee:"QJf3ax"}],9:[function(t,e){function n(t,e,n){t[0]=o(t[0],"fn-",null,n)}var r=t("ee").create(),o=t(1)(r);e.exports=r,o.inPlace(window,["setTimeout","setInterval","setImmediate"],"setTimer-"),r.on("setTimer-start",n)},{1:24,ee:"QJf3ax"}],10:[function(t,e){function n(){f.inPlace(this,p,"fn-")}function r(t,e){f.inPlace(e,["onreadystatechange"],"fn-")}function o(t,e){return e}function i(t,e){for(var n in t)e[n]=t[n];return e}var a=t("ee").create(),s=t(1),c=t(2),f=c(a),u=c(s),d=window.XMLHttpRequest,p=["onload","onerror","onabort","onloadstart","onloadend","onprogress","ontimeout"];e.exports=a,window.XMLHttpRequest=function(t){var e=new d(t);try{a.emit("new-xhr",[],e),u.inPlace(e,["addEventListener","removeEventListener"],"-",o),e.addEventListener("readystatechange",n,!1)}catch(r){try{a.emit("internal-error",[r])}catch(i){}}return e},i(d,XMLHttpRequest),XMLHttpRequest.prototype=d.prototype,f.inPlace(XMLHttpRequest.prototype,["open","send"],"-xhr-",o),a.on("send-xhr-start",r),a.on("open-xhr-start",r)},{1:6,2:24,ee:"QJf3ax"}],11:[function(t){function e(t){var e=this.params,r=this.metrics;if(!this.ended){this.ended=!0;for(var i=0;c>i;i++)t.removeEventListener(s[i],this.listener,!1);if(!e.aborted){if(r.duration=(new Date).getTime()-this.startTime,4===t.readyState){e.status=t.status;var a=t.responseType,f="arraybuffer"===a||"blob"===a||"json"===a?t.response:t.responseText,u=n(f);if(u&&(r.rxSize=u),this.sameOrigin){var d=t.getResponseHeader("X-NewRelic-App-Data");d&&(e.cat=d.split(", ").pop())}}else e.status=0;r.cbTime=this.cbTime,o("xhr",[e,r,this.startTime])}}}function n(t){if("string"==typeof t&&t.length)return t.length;if("object"!=typeof t)return void 0;if("undefined"!=typeof ArrayBuffer&&t instanceof ArrayBuffer&&t.byteLength)return t.byteLength;if("undefined"!=typeof Blob&&t instanceof Blob&&t.size)return t.size;if("undefined"!=typeof FormData&&t instanceof FormData)return void 0;try{return JSON.stringify(t).length}catch(e){return void 0}}function r(t,e){var n=i(e),r=t.params;r.host=n.hostname+":"+n.port,r.pathname=n.pathname,t.sameOrigin=n.sameOrigin}if(window.XMLHttpRequest&&XMLHttpRequest.prototype&&XMLHttpRequest.prototype.addEventListener&&!/CriOS/.test(navigator.userAgent)){t("loader").features.xhr=!0;var o=t("handle"),i=t(2),a=t("ee"),s=["load","error","abort","timeout"],c=s.length,f=t(1);t(4),t(3),a.on("new-xhr",function(){this.totalCbs=0,this.called=0,this.cbTime=0,this.end=e,this.ended=!1,this.xhrGuids={}}),a.on("open-xhr-start",function(t){this.params={method:t[0]},r(this,t[1]),this.metrics={}}),a.on("open-xhr-end",function(t,e){"loader_config"in NREUM&&"xpid"in NREUM.loader_config&&this.sameOrigin&&e.setRequestHeader("X-NewRelic-ID",NREUM.loader_config.xpid)}),a.on("send-xhr-start",function(t,e){var r=this.metrics,o=t[0],i=this;if(r&&o){var f=n(o);f&&(r.txSize=f)}this.startTime=(new Date).getTime(),this.listener=function(t){try{"abort"===t.type&&(i.params.aborted=!0),("load"!==t.type||i.called===i.totalCbs&&(i.onloadCalled||"function"!=typeof e.onload))&&i.end(e)}catch(n){try{a.emit("internal-error",[n])}catch(r){}}};for(var u=0;c>u;u++)e.addEventListener(s[u],this.listener,!1)}),a.on("xhr-cb-time",function(t,e,n){this.cbTime+=t,e?this.onloadCalled=!0:this.called+=1,this.called!==this.totalCbs||!this.onloadCalled&&"function"==typeof n.onload||this.end(n)}),a.on("xhr-load-added",function(t,e){var n=""+f(t)+!!e;this.xhrGuids&&!this.xhrGuids[n]&&(this.xhrGuids[n]=!0,this.totalCbs+=1)}),a.on("xhr-load-removed",function(t,e){var n=""+f(t)+!!e;this.xhrGuids&&this.xhrGuids[n]&&(delete this.xhrGuids[n],this.totalCbs-=1)}),a.on("addEventListener-end",function(t,e){e instanceof XMLHttpRequest&&"load"===t[0]&&a.emit("xhr-load-added",[t[1],t[2]],e)}),a.on("removeEventListener-end",function(t,e){e instanceof XMLHttpRequest&&"load"===t[0]&&a.emit("xhr-load-removed",[t[1],t[2]],e)}),a.on("fn-start",function(t,e,n){e instanceof XMLHttpRequest&&("onload"===n&&(this.onload=!0),("load"===(t[0]&&t[0].type)||this.onload)&&(this.xhrCbStart=(new Date).getTime()))}),a.on("fn-end",function(t,e){this.xhrCbStart&&a.emit("xhr-cb-time",[(new Date).getTime()-this.xhrCbStart,this.onload,e],e)})}},{1:"XL7HBI",2:12,3:10,4:6,ee:"QJf3ax",handle:"D5DuLP",loader:"G9z0Bl"}],12:[function(t,e){e.exports=function(t){var e=document.createElement("a"),n=window.location,r={};e.href=t,r.port=e.port;var o=e.href.split("://");return!r.port&&o[1]&&(r.port=o[1].split("/")[0].split("@").pop().split(":")[1]),r.port&&"0"!==r.port||(r.port="https"===o[0]?"443":"80"),r.hostname=e.hostname||n.hostname,r.pathname=e.pathname,r.protocol=o[0],"/"!==r.pathname.charAt(0)&&(r.pathname="/"+r.pathname),r.sameOrigin=!e.hostname||e.hostname===document.domain&&e.port===n.port&&e.protocol===n.protocol,r}},{}],13:[function(t,e){function n(t){return function(){r(t,[(new Date).getTime()].concat(i(arguments)))}}var r=t("handle"),o=t(1),i=t(2);"undefined"==typeof window.newrelic&&(newrelic=window.NREUM);var a=["setPageViewName","addPageAction","setCustomAttribute","finished","addToTrace","inlineHit","noticeError"];o(a,function(t,e){window.NREUM[e]=n("api-"+e)}),e.exports=window.NREUM},{1:22,2:23,handle:"D5DuLP"}],gos:[function(t,e){e.exports=t("7eSDFh")},{}],"7eSDFh":[function(t,e){function n(t,e,n){if(r.call(t,e))return t[e];var o=n();if(Object.defineProperty&&Object.keys)try{return Object.defineProperty(t,e,{value:o,writable:!0,enumerable:!1}),o}catch(i){}return t[e]=o,o}var r=Object.prototype.hasOwnProperty;e.exports=n},{}],D5DuLP:[function(t,e){function n(t,e,n){return r.listeners(t).length?r.emit(t,e,n):void(r.q&&(r.q[t]||(r.q[t]=[]),r.q[t].push(e)))}var r=t("ee").create();e.exports=n,n.ee=r,r.q={}},{ee:"QJf3ax"}],handle:[function(t,e){e.exports=t("D5DuLP")},{}],XL7HBI:[function(t,e){function n(t){var e=typeof t;return!t||"object"!==e&&"function"!==e?-1:t===window?0:i(t,o,function(){return r++})}var r=1,o="nr@id",i=t("gos");e.exports=n},{gos:"7eSDFh"}],id:[function(t,e){e.exports=t("XL7HBI")},{}],G9z0Bl:[function(t,e){function n(){var t=p.info=NREUM.info,e=f.getElementsByTagName("script")[0];if(t&&t.licenseKey&&t.applicationID&&e){s(d,function(e,n){e in t||(t[e]=n)});var n="https"===u.split(":")[0]||t.sslForHttp;p.proto=n?"https://":"http://",a("mark",["onload",i()]);var r=f.createElement("script");r.src=p.proto+t.agent,e.parentNode.insertBefore(r,e)}}function r(){"complete"===f.readyState&&o()}function o(){a("mark",["domContent",i()])}function i(){return(new Date).getTime()}var a=t("handle"),s=t(1),c=window,f=c.document;t(2);var u=(""+location).split("?")[0],d={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",agent:"js-agent.newrelic.com/nr-686.min.js"},p=e.exports={offset:i(),origin:u,features:{}};f.addEventListener?(f.addEventListener("DOMContentLoaded",o,!1),c.addEventListener("load",n,!1)):(f.attachEvent("onreadystatechange",r),c.attachEvent("onload",n)),a("mark",["firstbyte",i()])},{1:22,2:13,handle:"D5DuLP"}],loader:[function(t,e){e.exports=t("G9z0Bl")},{}],22:[function(t,e){function n(t,e){var n=[],o="",i=0;for(o in t)r.call(t,o)&&(n[i]=e(o,t[o]),i+=1);return n}var r=Object.prototype.hasOwnProperty;e.exports=n},{}],23:[function(t,e){function n(t,e,n){e||(e=0),"undefined"==typeof n&&(n=t?t.length:0);for(var r=-1,o=n-e||0,i=Array(0>o?0:o);++r<o;)i[r]=t[e+r];return i}e.exports=n},{}],24:[function(t,e){function n(t){return!(t&&"function"==typeof t&&t.apply&&!t[i])}var r=t("ee"),o=t(1),i="nr@wrapper",a=Object.prototype.hasOwnProperty;e.exports=function(t){function e(t,e,r,a){function nrWrapper(){var n,i,s,f;try{i=this,n=o(arguments),s=r&&r(n,i)||{}}catch(d){u([d,"",[n,i,a],s])}c(e+"start",[n,i,a],s);try{return f=t.apply(i,n)}catch(p){throw c(e+"err",[n,i,p],s),p}finally{c(e+"end",[n,i,f],s)}}return n(t)?t:(e||(e=""),nrWrapper[i]=!0,f(t,nrWrapper),nrWrapper)}function s(t,r,o,i){o||(o="");var a,s,c,f="-"===o.charAt(0);for(c=0;c<r.length;c++)s=r[c],a=t[s],n(a)||(t[s]=e(a,f?s+o:o,i,s))}function c(e,n,r){try{t.emit(e,n,r)}catch(o){u([o,e,n,r])}}function f(t,e){if(Object.defineProperty&&Object.keys)try{var n=Object.keys(t);return n.forEach(function(n){Object.defineProperty(e,n,{get:function(){return t[n]},set:function(e){return t[n]=e,e}})}),e}catch(r){u([r])}for(var o in t)a.call(t,o)&&(e[o]=t[o]);return e}function u(e){try{t.emit("internal-error",e)}catch(n){}}return t||(t=r),e.inPlace=s,e.flag=i,e}},{1:23,ee:"QJf3ax"}]},{},["G9z0Bl",4,11,5]);
          ;NREUM.info={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",licenseKey:"d2d871f55d",applicationID:"10375442",sa:1,agent:"js-agent.newrelic.com/nr-686.min.js"}
          window.s_265 = window.s_265 || {};
          window.s_265.channel = 'us.smpvault';
          window.s_265.s_265_account = 'aolsmp,aolsvc';
        </script>
        <script>
          window.fbAsyncInit = function() {
          FB.init({
            appId: 174021895985194,
            xfbml: true,
            version: 'v2.3'
          });
        };
        (function(d, s, id){
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {return;}
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_US/sdk.js";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        </script>
        <script>
          window.adsDevilAd = window.adsDevilAd || {};
          (function(d){
              var f = d.getElementsByTagName('SCRIPT')[0], p = d.createElement('SCRIPT');
              p.type = 'text/javascript';
              p.async = true;
              p.src = '//o.aolcdn.com/ads/adsWrapper.js';
              p.onload = p.onreadystatechange = function () {
              window.adSetAdURL('${ isDeveloping ? '/_uac/adpage.html' : 'http://www.stylemepretty.com/_uac/adpage.html' }');
              window.adSetMOAT("1");
              };
              f.parentNode.insertBefore(p, f);
          }(document));
          window.bN_cfg = { h: location.hostname };
          window.s_265_account = "aolsmp,aolsvc";
          (function(){
            var d = document, s = d.createElement('script');
            s.type = 'text/javascript';
            s.src = (location.protocol == 'https:' ? 'https://s' : 'http://o') + '.aolcdn.com/os_merge/?file=/aol/beacon.min.js&file=/aol/omniture.min.js';
            d.getElementsByTagName('head')[0].appendChild(s);
          })();
        </script>

        <script src="${ isDeveloping ? '/build/static/vendor.js' : assets.vendor.js}"></script>
        <script src="${ isDeveloping ? '/build/static/main.js' : assets.main.js}"></script>
      </body>
    </html>
  `;
};

// SSR Logic
server.get('*', (req, res) => {
  const store = configureStore();
  const routes = createRoutes(store);
  const history = createMemoryHistory(req.path);
  const { dispatch } = store;
  match({ routes, history }, (err, redirectLocation, renderProps) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }

    if (!renderProps)
      return res.status(404).send('Not found');

    const { components } = renderProps;

    // Define locals to be provided to all lifecycle hooks:
    const locals = {
     path: renderProps.location.pathname,
     query: renderProps.location.query,
     params: renderProps.params,

     // Allow lifecycle hooks to dispatch Redux actions:
     dispatch,
   };

    trigger('fetch', components, locals)
      .then(() => {
        const initialState = store.getState();
        const InitialView = (
          <Provider store={store}>
            <RouterContext {...renderProps} />
          </Provider>
        );

        // just call html = ReactDOM.renderToString(InitialView)
        // to if you don't want Aphrodite. Also change renderFullPage
        // accordingly
        const data = StyleSheetServer.renderStatic(
            () => ReactDOM.renderToString(InitialView)
        );
        res.status(200).send(renderFullPage(data, initialState, assets));
      })
      .catch(e => console.log(e));
  });
});

// Listen
server.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }

  console.info('==> 🌎 Listening on port %s.' +
    'Open up http://0.0.0.0:%s/ in your browser.', port, port);
});

module.exports = server;
