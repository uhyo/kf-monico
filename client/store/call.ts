import * as Reflux from 'reflux';
import * as objectAssign from 'object-assign';

import * as pageActions from '../action/page';
import * as callActions from '../action/call';

import {UserDoc, CallDoc, CallDocWithUser} from '../../lib/db';

export interface CallStoreData{
    date: number;
    calls:Array<CallDocWithUser>;
}

let callStore = Reflux.createStore({
    getInitialState():CallStoreData{
        return this.state;
    },
    init():void{
        this.state = {
            calls: [],
        };
        this.listenToMany(callActions);
        this.listenTo(pageActions.rojinPage,this.onRojinPage);
    },
    onInit({calls}):void{
        this.state=objectAssign({}, this.state, {calls});
        this.trigger(this.state);
    },
    onRojinPage({date, calls}):void{
        this.state=objectAssign({}, this.state, {date, calls});
        this.trigger(this.state);
    },

    onCall({date, eccs, rojin_name}):void{
        this.state = objectAssign({}, this.state, {
            calls: this.state.calls.map(call =>
                           call.eccs===eccs ?
                           objectAssign({},call,{
                               occupied: true,
                               occupied_by: rojin_name
                           }) :
                           call)
        });
        this.trigger(this.state);
    },
    onCallCancel({date, rojin_name}):void{
        this.state = objectAssign({}, this.state, {
            calls: this.state.calls.map(call =>
                           call.date===date && call.occupied_by===rojin_name ?
                           objectAssign({},call,{
                               occupied: false,
                               occupied_by: ""
                           }) :
                           call)
        });
        this.trigger(this.state);
    },
    onWake({date, eccs}):void{
        this.state = objectAssign({}, this.state, {
            calls: this.state.calls.map(call =>
                           call.date===date && call.eccs===eccs ?
                           objectAssign({},call,{
                               awake: true,
                               confirmed: false,
                               occupied: false,
                               occupied_by: ""
                           }) :
                           call)
        });
        this.trigger(this.state);
    },
    onConfirm({date, eccs}):void{
        this.state = objectAssign({}, this.state, {
            calls: this.state.calls.map(call =>
                           call.date===date && call.eccs===eccs ?
                           objectAssign({},call,{
                               awake: true,
                               confirmed: true,
                               occupied: false,
                               occupied_by: ""
                           }) :
                           call)
        });
        this.trigger(this.state);
    },
    onSnooze({date, eccs, next_hour, next_minute}):void{
        this.state = objectAssign({}, this.state, {
            calls: this.state.calls.map(call =>
                           call.date===date && call.eccs===eccs ?
                           objectAssign({},call,{
                               occupied: false,
                               occupied_by: "",
                               next_hour,
                               next_minute,
                               snooze: call.snooze+1
                           }) :
                           call).sort((call1,call2)=>{
                               return call1.next_hour - call2.next_hour || call1.next_minute - call2.next_minute;
                           })
        });
        this.trigger(this.state);
    },
});

export default callStore;

