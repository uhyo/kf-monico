///<reference path="../../typings/reflux.d.ts" />
import * as Reflux from 'reflux';
import Ws from '../lib/ws';

import {UserDoc, CallDoc} from '../../lib/db';

import * as errorActions from './error';

//ページ遷移
export var entryPage = Reflux.createAction<{
    eccs: string;
}>();

export var mainPage = Reflux.createAction<{
    user: UserDoc;
    call: CallDoc;
}>();

//ok
export var callokPage = Reflux.createAction<{}>();

