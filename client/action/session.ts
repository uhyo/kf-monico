import * as Reflux from 'reflux';
import * as objectAssign from 'object-assign';
import Ws from '../lib/ws';


import {UserDoc, CallEntry} from '../../lib/db';

import * as errorActions from './error';
import * as pageActions from './page';

export var login = Reflux.createAction<{
    ws: Ws;
    eccs: string;
}>();

login.listen(({ws, eccs})=>{
    /* eccsであれする */
    pageActions.loading({loading: true});
    ws.send({
        command: "login",
        eccs
    }).then(()=>{
        pageActions.loading({loading: false});
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

//モニコ登録
export var call = Reflux.createAction<{
    ws: Ws,
    call: CallEntry
}>();

call.listen(({ws, call})=>{
    pageActions.loading({loading: true});
    ws.send(objectAssign({command:"call"}, call)).then(()=>{
        pageActions.loading({loading: false});
        pageActions.callokPage({});
    });
});
