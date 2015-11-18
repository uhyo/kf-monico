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

