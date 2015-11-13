///<reference path="../../typings/reflux.d.ts" />
import * as Reflux from 'reflux';
import Ws from '../lib/ws';

import * as errorActions from './error';

export var login = Reflux.createAction<{
    ws: Ws;
    eccs: string;
}>();

export var login_success = Reflux.createAction<{
}>();

login.listen(({ws, eccs})=>{
    /* eccsであれする */
    ws.send({
        command: "login",
        eccs
    });
});

