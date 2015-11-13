///<reference path="../typings/bundle.d.ts" />
//クライアントとの　接　続　を一挙に管理するひとだ

import {default as Db, SessionDoc} from './db';
import Web from './web';

import * as config from 'config';
import * as randomString from 'random-string';

import * as validator from './validator';

import * as WebSocket from 'ws';
import {Promise} from 'es6-promise';



export default class Session{
    private wss:Array<WebSocket>;
    private sessionid:WeakMap<WebSocket,string>;
    private collection:string;
    constructor(private db:Db){
        this.wss=[];
        this.sessionid = new WeakMap<WebSocket, string>();
        this.collection = config.get<string>("mongodb.collections.session");
    }
    init():Promise<{}>{
        return Promise.resolve({});
    }
    //wsファミリに追加された
    add(ws:WebSocket):void{
        this.wss.push(ws);
        ws.on("message",(data:string,flags)=>{
            /* JSONで表されるものを受け取る */
            try{
                let obj = JSON.parse(data);
                if(obj.comid != null && "number"!==typeof obj.comid){
                    //comidに変な値を渡されても困る
                    throw new Error("Invalid comid");
                }
                this.command(ws, obj);
            }catch(e){
                ws.close();
            }
        });
        ws.on("close",()=>{
            //wsがcloseされた
            ws.removeAllListeners();
            this.remove(ws);
        });
    }
    //もういない
    remove(ws:WebSocket):void{
        this.wss = this.wss.filter(w => w!==ws);
    }
    //オブジェクトを送る
    send(ws:WebSocket,obj:any):void{
        ws.send(JSON.stringify(obj));
    }
    sendError(ws:WebSocket,err:Error):void{
        this.send(ws,{
            command: "error",
            error: String(err)
        });
    }
    //コマンド処理
    command(ws:WebSocket, obj:any):void{
        let coll = this.db.collection(this.collection);
        switch(obj.command){
            case "session":
                //セッションを要求
                let getid:Promise<string>;
                if("string"===typeof obj.sessionid){
                    getid = coll.findOneAndUpdate({
                        id : obj.sessionid
                    },{
                        $set: {
                            time: new Date()
                        }
                    }).then((doc:SessionDoc)=>{
                        if(doc==null){
                            //新規のセッションが必要
                            //セキュリティ上の観点から、向こうが要求するセッションIDは使用せず新規のセッションIDを生成
                            return this.makeNewSession();
                        }else{
                            return obj.sessionid;
                        }
                    });
                }else{
                    //新規のセッションを作る
                    getid = this.makeNewSession();
                }
                //セッションIDが得られたら返す
                getid.then((nid)=>{
                    //登録
                    this.sessionid.set(ws, nid);
                    this.send(ws, {
                        command: "session",
                        sessionid: nid,
                        ack: obj.comid
                    });
                }).catch((err)=>{
                    this.sendError(ws, err);
                });
                break;
            case "login":
                //セッションにユーザIDを登録
                if(!validator.isECCSID(obj.eccs)){
                    this.sendError(ws, new Error("Validation Error"));
                    return;
                }
                let sessid = this.sessionid.get(ws);
                if(sessid==null){
                    //セッションがなかった
                    this.sendError(ws, new Error("No Session"));
                    return;
                }
                coll.updateOne({
                    id: sessid
                },{
                    $set: {
                        eccs: obj.eccs
                    }
                }).then((obj)=>{
                    if(obj.result && obj.result.nModified === 0){
                        //セッションがなかった
                        this.sendError(ws, new Error("Session Expired"));
                        this.sessionid.delete(ws);
                    }
                }).catch((err)=>{
                    this.sendError(ws, err);
                });
                break;
        }
    }
    private makeNewSession():Promise<string>{
        let nid = randomString({length: 20});
        return this.db.collection(this.collection).insertOne({
            id: nid,
            eccs: null,
            rojin: false,
            rojin_name: null,
            time: new Date()
        }).then((_)=>{
            return nid;
        });
    }
}
