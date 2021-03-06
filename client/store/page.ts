import {
    Store,
} from '../reflux';

import * as pageActions from '../action/page';
import * as errorActions from '../action/error';

import {UserDoc, CallDoc, CallDocWithUser, CommitteeMember} from '../../lib/db';

export interface PageStoreData{
    //ローディング画面
    loading: boolean;
    loading_content: boolean;
    loading_type: number;

    //エラー画面
    error: boolean;
    error_message: string;

    page: string;
    system?:boolean;
    eccs?:string;
    user?:UserDoc;
    call?:CallDoc;
    rojin_name?:string;
    rojin_leader?:boolean;
    nocalls?:Array<CommitteeMember>;
}

export class PageStore extends Store<PageStoreData>{
    constructor(){
        super();
        this.state = {
            loading: false,
            loading_content: false,
            loading_type: 0,
            error: false,
            error_message: "",
            page: "top",
        };
        this.listenToMany(pageActions);
        this.listenToMany(errorActions);

        window.addEventListener("popstate",(e)=>{
            if(e.state){
                this.state = {
                    ... e.state,
                };
                this.trigger(this.state);
            }
        });
    }
    history():void{
        //stateにアレを追加
        let basepath = document.body.getAttribute("data-basepath");
        history.pushState(this.state, "", this.state.page==="top" ? basepath : basepath+this.state.page);
    }
    onError(err):void{
        //エラーが発生したのでエラーを表示するぜ！！！！！！！！！！
        this.state = {
            ... this.state,
            loading: false,
            error: true,
            error_message: err.message || err
        };
        this.trigger(this.state);
    }
    onClear():void{
        //エラーをけす
        this.state = {
            ... this.state,
            error: false,
        };
        this.trigger(this.state);
    }
    onLoading({loading}):void{
        let prev_loading = this.state.loading;
        this.state = {
            ... this.state,
            loading,
            loading_type: 2,
            loading_content: this.state.loading || loading,
        };
        this.trigger(this.state);
        if(prev_loading===true && loading===false){
            //コンテンツ表示を遅らせる（収納のため）
            setTimeout(()=>{
                this.state = {
                    ... this.state,
                    loading_content: false
                };
                this.trigger(this.state);
            }, 500);
        }
    }
    onTopPage():void{
        this.state = {
            ... this.state,
            page:"top",
        };
        this.history();
        this.trigger(this.state);
    }
    onEntryPage({system,eccs,user}):void{
        this.state = {
            ... this.state,
            page:"entry",
            system,
            eccs,
            user
        };
        this.history();
        this.trigger(this.state);
    }
    onMainPage({user, call}):void{
        this.state = {
            ... this.state,
            page:"main",
            user,
            call,
        };
        this.history();
        this.trigger(this.state);
    }
    onCallokPage():void{
        this.state = {
            ... this.state,
            page: "callok"
        };
        this.history();
        this.trigger(this.state);
    }
    onRojinTop():void{
        this.state = {
            ... this.state,
            page: "rojintop"
        };
        this.history();
        this.trigger(this.state);
    }
    onRojinPage({
        rojin_name,
        rojin_leader,
    }):void{
        this.state = {
            ... this.state,
            page: "rojin",
            rojin_name,
            rojin_leader,
        };
        this.history();
        this.trigger(this.state);
    }
    onGotNocall({nocalls}):void{
        this.state = {
            ... this.state,
            nocalls
        };
        this.trigger(this.state);
    }
}

const pageStore = new PageStore();


export default pageStore;
