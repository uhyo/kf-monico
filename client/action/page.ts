import Ws from '../lib/ws';
import {
    createAction,
} from '../reflux';

import {UserDoc, CallDoc, CallDocWithUser, CommitteeMember} from '../../lib/db';

import * as errorActions from './error';

//ロード
export var loading = createAction<{
    loading: boolean;
}>();

//ページ遷移
export var topPage = createAction<{}>();

export var entryPage = createAction<{
    system?: boolean;
    eccs: string;
    user?: UserDoc;
}>();

export var mainPage = createAction<{
    user: UserDoc;
    call: CallDoc;
}>();

//ok
export var callokPage = createAction<{}>();

//老人向け
export var rojinTop = createAction<{}>();

export var rojinPage = createAction<{
    date: number;
    rojin_name: string;
    rojin_leader: boolean;
    calls: Array<CallDocWithUser>;
}>();

export var gotNocall = createAction<{
    nocalls: Array<CommitteeMember>;
}>();
