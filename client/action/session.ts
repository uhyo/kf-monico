///<reference path="../../typings/reflux.d.ts" />
import * as Reflux from 'reflux';
import * as objectAssign from 'object-assign';
import Ws from '../lib/ws';


import {UserDoc} from '../../lib/db';

import * as errorActions from './error';

export var login = Reflux.createAction<{
    ws: Ws;
    eccs: string;
}>();

login.listen(({ws, eccs})=>{
    /* eccsであれする */
    ws.send({
        command: "login",
        eccs
    });
});

//ユーザー情報登録
export var entry = Reflux.createAction<{
    ws: Ws,
    user: UserDoc
}>();

entry.listen(({ws, user})=>{
    ws.send(objectAssign({command:"entry"}, user));
});

