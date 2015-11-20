///<reference path="../../typings/bundle.d.ts" />
///<reference path="../../typings/reflux.d.ts" />

import * as Reflux from 'reflux';
import * as objectAssign from 'object-assign';

import * as pageActions from '../action/page';

import {UserDoc, CallDoc, CallDocWithUser} from '../../lib/db';

export interface PageStoreData{
    loading: boolean;
    loading_content: boolean;
    loading_type: number;
    page: string;
    eccs?:string;
    user?:UserDoc;
    call?:CallDoc;
    rojin_name?:string;
}

let pageStore = Reflux.createStore({
    getInitialState():PageStoreData{
        return this.state;
    },
    init():void{
        this.state = {
            loading: false,
            loading_contnet: false,
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
        let basepath = document.body.getAttribute("data-basepath");
        history.pushState(this.state, "", this.state.page==="top" ? basepath : basepath+this.state.page);
    },
    onLoading({loading}):void{
        let prev_loading = this.state.loading;
        this.state = objectAssign({},this.state,{
            loading,
            loading_type: loading ? Math.floor(Math.random()*2) : 0,
            loading_content: this.state.loading || loading,
        });
        this.trigger(this.state);
        if(prev_loading===true && loading===false){
            //コンテンツ表示を遅らせる（収納のため）
            setTimeout(()=>{
                this.state = objectAssign({}, this.state, {
                    loading_content: false
                });
                this.trigger(this.state);
            }, 500);
        }
    },
    onTopPage():void{
        this.state = objectAssign({},this.state,{
            page:"top"
        });
        this.history();
        this.trigger(this.state);
    },
    onEntryPage({eccs,user}):void{
        this.state = objectAssign({},this.state,{
            page:"entry",
            eccs,
            user
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
    },
    onCallokPage():void{
        this.state = objectAssign({},this.state,{
            page: "callok"
        });
        this.history();
        this.trigger(this.state);
    },
    onRojinTop():void{
        this.state = objectAssign({},this.state,{
            page: "rojintop"
        });
        this.history();
        this.trigger(this.state);
    },
    onRojinPage({
        rojin_name
    }):void{
        this.state = objectAssign({},this.state,{
            page: "rojin",
            rojin_name,
        });
        this.history();
        this.trigger(this.state);
    }
});

export default pageStore;
