///<reference path="../../typings/bundle.d.ts" />
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';
import Ws from '../lib/ws';

document.addEventListener("DOMContentLoaded",()=>{
    ReactDOM.render(<App/>, document.getElementById('app'));
    //ws
    (new Ws()).init();
},false);
