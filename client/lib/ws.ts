//ws with server

import * as extend from 'extend';

import * as errorActions from '../action/error';
import * as pageActions from '../action/page';
import * as callActions from '../action/call';

declare var io:any;

export default class Ws{
    private ws:any;
    private comid:number;
    private ack_queue:Array<{
        comid:number;
        handler:(obj:any)=>void
    }>;
    constructor(){
        this.comid = 1;
        this.ack_queue = [];
    }
    init():void{
        let basepath = document.body.getAttribute("data-basepath");
        //let ws = this.ws = new WebSocket(location.origin.replace(/^http/,"ws")+basepath+"ws");
        let ws = this.ws = io();
        //ローディングにしておく
        pageActions.loading({
            loading: true
        });
        ws.addEventListener("error",(e)=>{
            errorActions.error(new Error(e.message));
        });
        ws.on("connect",()=>{
            this.initSession();
        });
        ws.addEventListener("disconnect",(e)=>{
            errorActions.error(new Error("サーバーとの接続に失敗しました。ページをリロードしてください。"));
        });
        ws.on("message",(obj)=>{
            //メッセージがきた
            this.message(obj);
        });
    }
    //WebSocketコネクションが開通したのでセッションを初期化する
    private initSession():void{
        this.send({
            command: "session",
            sessionid: localStorage.getItem("monico_sessionid") || null
        }).then((response)=>{
            if(localStorage.getItem("monico_load_flg")!=="true"){
                //初回ロードだけはわざと長くする
                setTimeout(()=>{
                    localStorage.setItem("monico_load_flg","true");
                    pageActions.loading({
                        loading: false
                    });
                },7000);
            }else{
                pageActions.loading({
                    loading: false
                });
            }
            if("string"===typeof response.sessionid){
                localStorage.setItem("monico_sessionid", response.sessionid);
                console.log("session:",response.sessionid);
            }
        });
    }
    send(obj:any):Promise<any>{
        //コマンドを送信
        let comid = this.comid++;
        let com = extend({},obj,{
            comid
        });
        this.ws.emit("message",com);
        if(this.requiresAck(obj)){
            return new Promise((fulfilled, rejected)=>{
                this.ack_queue.push({
                    comid,
                    handler: fulfilled
                });
            });
        }else{
            return Promise.resolve({});
        }
    }
    private message(obj:any):void{
        //メッセージがきた
        console.log(obj);
        let command = obj.command;
        switch(command){
            case "error":
                //エラーがきた
                errorActions.error(new Error(obj.error));
                break;
            //ページ遷移
            case "toppage":
                pageActions.topPage({});
                break;
            case "entrypage":
                pageActions.entryPage({
                    system: obj.system || false,
                    eccs: obj.eccs,
                    user: obj.user
                });
                break;
            case "mainpage":
                pageActions.mainPage({
                    user: obj.user,
                    call: obj.call
                });
                break;
            case "rojintop":
                pageActions.rojinTop({});
                break;
            case "rojinpage":
                pageActions.rojinPage({
                    date: obj.date,
                    rojin_name: obj.rojin_name,
                    calls: obj.calls
                });
                break;
            //老人リスト系
            case "rojin-call":
                callActions.call({
                    date: obj.date,
                    eccs: obj.eccs,
                    rojin_name: obj.rojin_name
                });
                break;
            case "rojin-call-cancel":
                callActions.callCancel({
                    date: obj.date,
                    rojin_name: obj.rojin_name
                });
                break;
            case "rojin-wake":
                callActions.wake({
                    date: obj.date,
                    eccs: obj.eccs
                });
                break;
            case "rojin-confirm":
                callActions.confirm({
                    date: obj.date,
                    eccs: obj.eccs
                });
                break;
            case "rojin-snooze":
                callActions.snooze({
                    date: obj.date,
                    eccs: obj.eccs,
                    next_hour: obj.next_hour,
                    next_minute: obj.next_minute
                });
                break;

        }
        let ack:number=obj.ack;
        if("number"!==typeof ack){
            return;
        }
        for(let i=0, q=this.ack_queue, l=q.length; i<l;i++){
            if(q[i].comid === ack){
                //おへんじがきた
                q[i].handler(obj);
                q.splice(i,1);
                break;
            }
        }
    }
    //送信メッセージがackを必要とするか
    private requiresAck(obj:any):boolean{
        let command:string=obj.command;
        return command==="session" || command==="login" || command==="call" || command==="rojin-console";
    }
}
