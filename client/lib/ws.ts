//ws with server

import * as extend from 'extend';

import * as errorActions from '../action/error';
import * as pageActions from '../action/page';

export default class Ws{
    private ws:WebSocket;
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
        let ws = this.ws = new WebSocket(location.origin.replace(/^http/,"ws")+"/");
        ws.addEventListener("error",(e)=>{
            errorActions.error(new Error(e.message));
        });
        ws.addEventListener("open",(e)=>{
            this.initSession();
        });
        ws.addEventListener("close",(e)=>{
            console.log("clooosed");
        });
        ws.addEventListener("message",(e)=>{
            //メッセージがきた
            try{
                let obj = JSON.parse(e.data);
                this.message(obj);
            }catch(e){
                ws.close();
            }
        });
    }
    //WebSocketコネクションが開通したのでセッションを初期化する
    private initSession():void{
        this.send({
            command: "session",
            sessionid: localStorage.getItem("monico_sessionid") || null
        }).then((response)=>{
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
        this.ws.send(JSON.stringify(com));
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
        let command = obj.command;
        switch(command){
            case "error":
                //エラーがきた
                errorActions.error(new Error(obj.error));
                break;
            //ページ遷移
            case "entrypage":
                pageActions.entryPage({});
                break;
            case "mainpage":
                pageActions.mainPage({
                    user: obj.user
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
        return command==="session";
    }
}
