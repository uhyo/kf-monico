///<reference path="../../typings/bundle.d.ts" />
///<reference path="../../typings/reflux.d.ts" />

import * as Reflux from 'reflux';
import * as objectAssign from 'object-assign';

import * as pageActions from '../action/page';

import {UserDoc} from '../../lib/db';

export interface PageStoreData{
    page: string;
    eccs?:string;
    user?:UserDoc;
}

let pageStore = Reflux.createStore({
    getInitialState():PageStoreData{
        return this.state;
    },
    init():void{
        this.state = {
            page: "top"
        };
        this.listenToMany(pageActions);
    },
    onEntryPage({eccs}):void{
        this.state = objectAssign({},this.state,{
            page:"entry",
            eccs
        });
        this.trigger(this.state);
    },
    onMainPage({user}):void{
        this.state = objectAssign({},this.state,{
            page:"entry",
            user
        });
        this.trigger(this.state);
    }
});

export default pageStore;
