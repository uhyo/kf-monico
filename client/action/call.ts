///<reference path="../../typings/reflux.d.ts" />
import * as Reflux from 'reflux';
import Ws from '../lib/ws';

import {CallDocWithUser} from '../../lib/db';

//老人用モニコリスト的なやつ
//
export var init = Reflux.createAction<{
    sleepings: Array<CallDocWithUser>;
    preparings: Array<CallDocWithUser>;
}>();

export var call = Reflux.createAction<{
    date: number;
    eccs: string;
    rojin_name: string;
}>();

export var callCancel = Reflux.createAction<{
    date: number;
    rojin_name: string;
}>();

export var wake = Reflux.createAction<{
    date: number;
    eccs: string;
}>();
export var confirm = Reflux.createAction<{
    date: number;
    eccs: string;
}>();
