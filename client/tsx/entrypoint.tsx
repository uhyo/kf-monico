///<reference path="../../typings/bundle.d.ts" />
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';
import Ws from '../lib/ws';
import links from '../lib/links';

document.addEventListener("DOMContentLoaded",()=>{
    let ws = new Ws();
    ws.init();
    links(ws);
    ReactDOM.render(<App ws={ws}/>, document.getElementById('app'));
},false);
