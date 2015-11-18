///<reference path="../../typings/bundle.d.ts" />
///<reference path="../../typings/reflux.d.ts" />

import * as Reflux from 'reflux';
import * as objectAssign from 'object-assign';

import * as pageActions from '../action/page';
import * as callActions from '../action/call';

import {UserDoc, CallDoc, CallDocWithUser} from '../../lib/db';

export interface CallStoreData{
    sleepings:Array<CallDocWithUser>;
    preparings:Array<CallDocWithUser>;
}

let callStore = Reflux.createStore({
    getInitialState():CallStoreData{
        return this.state;
    },
    init():void{
        this.state = {
            sleepings: [],
            preparings: []
        };
        this.listenToMany(callActions);
        this.listenTo(pageActions.rojinPage,this.onRojinPage);
    },
    onInit({sleepings, preparings}):void{
        this.state=objectAssign({}, this.state, {sleepings, preparings});
        this.trigger(this.state);
    },
    onRojinPage({sleepings, preparings}):void{
        this.state=objectAssign({}, this.state, {sleepings, preparings});
        this.trigger(this.state);
    }
});

export default callStore;

