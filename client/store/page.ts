///<reference path="../../typings/bundle.d.ts" />
///<reference path="../../typings/reflux.d.ts" />

import * as Reflux from 'reflux';
import * as objectAssign from 'object-assign';

import * as pageActions from '../action/page';

import {UserDoc, CallDoc} from '../../lib/db';

export interface PageStoreData{
    page: string;
    eccs?:string;
    user?:UserDoc;
    call?:CallDoc;
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

        window.addEventListener("popstate",(e)=>{
            if(e.state){
                this.state = objectAssign({}, e.state);
                this.trigger(this.state);
            }
        });
    },
    history():void{
        //stateにアレを追加
        history.pushState(this.state, "", this.state.page==="top" ? "/" : "/"+this.state.page);
    },
    onEntryPage({eccs}):void{
        this.state = objectAssign({},this.state,{
            page:"entry",
            eccs
        });
        this.history();
        this.trigger(this.state);
    },
    onMainPage({user, call}):void{
        this.state = objectAssign({},this.state,{
            page:"main",
            user,
            call
        });
        this.history();
        this.trigger(this.state);
    }
});

export default pageStore;
