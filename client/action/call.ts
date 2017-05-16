import Ws from '../lib/ws';
import {
    createAction,
} from '../reflux';

import {CallDocWithUser} from '../../lib/db';

//老人用モニコリスト的なやつ
//
export var init = createAction<{
    sleepings: Array<CallDocWithUser>;
    preparings: Array<CallDocWithUser>;
}>();

export var call = createAction<{
    date: number;
    eccs: string;
    rojin_name: string;
}>();

export var callCancel = createAction<{
    date: number;
    rojin_name: string;
}>();

export var wake = createAction<{
    date: number;
    eccs: string;
}>();
export var confirm = createAction<{
    date: number;
    eccs: string;
}>();
export var snooze = createAction<{
    date: number;
    eccs: string;
    next_hour: number;
    next_minute: number;
}>();
