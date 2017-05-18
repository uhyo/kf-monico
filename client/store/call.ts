import {
    Store,
} from '../reflux';

import * as pageActions from '../action/page';
import * as callActions from '../action/call';

import {UserDoc, CallDoc, CallDocWithUser} from '../../lib/db';

export interface CallStoreData{
    date: number;
    calls:Array<CallDocWithUser>;
}

export class CallStore extends Store<CallStoreData>{
    constructor(){
        super();
        this.state = {
            date: 0,
            calls: [],
        };
        this.listenToMany(callActions);
        this.listenTo(pageActions.rojinPage, this.onRojinPage.bind(this));
    }
    onInit({calls}):void{
        this.state = {
            ... this.state,
            calls,
        };
        this.trigger(this.state);
    }
    onRojinPage({date, calls}):void{
        this.state = {
            ... this.state,
            date,
            calls,
        };
        this.trigger(this.state);
    }

    onCall({date, eccs, rojin_name}):void{
        this.state = {
            ... this.state,
            calls: this.state.calls.map(call =>
                           call.eccs===eccs ?
                            {
                                ... call,
                                occupied: true,
                                occupied_by: rojin_name,
                            } :
                           call),
        };
        this.trigger(this.state);
    }
    onCallCancel({date, rojin_name}):void{
        this.state = {
            ... this.state,
            calls: this.state.calls.map(call =>
                           call.date===date && call.occupied_by===rojin_name ?
                            {
                                ... call,
                                occupied: false,
                                occupied_by: '',
                           } :
                           call),
        };
        this.trigger(this.state);
    }
    onWake({date, eccs}):void{
        this.state = {
            ... this.state,
            calls: this.state.calls.map(call =>
                           call.date===date && call.eccs===eccs ?
                            {
                                ... call,
                                awake: true,
                                confirmed: false,
                                occupied: false,
                                occupied_by: '',
                           } :
                           call),
        };
        this.trigger(this.state);
    }
    onConfirm({date, eccs}):void{
        this.state = {
            ... this.state,
            calls: this.state.calls.map(call =>
                           call.date===date && call.eccs===eccs ?
                            {
                                ... call,
                                awake: true,
                                confirmed: true,
                                occupied: false,
                                occupied_by: '',
                           } :
                           call),
        };
        this.trigger(this.state);
    }
    onSnooze({date, eccs, next_hour, next_minute}):void{
        this.state = {
            ... this.state,
            calls: this.state.calls.map(call =>
                           call.date===date && call.eccs===eccs ?
                            {
                                ... call,
                                occupied: false,
                                occupied_by: '',
                                next_hour,
                                next_minute,
                                snooze: call.snooze+1,
                           } :
                           call).sort((call1,call2)=>{
                               return call1.next_hour - call2.next_hour || call1.next_minute - call2.next_minute;
                           }),
        };
        this.trigger(this.state);
    }
    onAssign({date, eccs, rojin_name}): void{
        this.state = {
            ... this.state,
            calls: this.state.calls.map(call =>
                call.date===date && call.eccs===eccs ?
                {
                    ... call,
                    assigned: rojin_name,
                } :
                call),
        };
        this.trigger(this.state);
    }
}

let callStore = new CallStore();

export default callStore;

