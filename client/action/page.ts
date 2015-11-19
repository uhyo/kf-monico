///<reference path="../../typings/reflux.d.ts" />
import * as Reflux from 'reflux';
import Ws from '../lib/ws';

import {UserDoc, CallDoc, CallDocWithUser} from '../../lib/db';

import * as errorActions from './error';

//ロード
export var loading = Reflux.createAction<{
    loading: boolean;
}>();

//ページ遷移
export var topPage = Reflux.createAction<{}>();

export var entryPage = Reflux.createAction<{
    eccs: string;
    user?: UserDoc;
}>();

export var mainPage = Reflux.createAction<{
    user: UserDoc;
    call: CallDoc;
}>();

//ok
export var callokPage = Reflux.createAction<{}>();

//老人向け
export var rojinTop = Reflux.createAction<{}>();

export var rojinPage = Reflux.createAction<{
    date: number;
    rojin_name: string;
    calls: Array<CallDocWithUser>;
}>();
