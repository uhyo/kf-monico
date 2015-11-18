///<reference path="../typings/bundle.d.ts" />
//クライアントとの　接　続　を一挙に管理するひとだ

import Db from './db';
import Web from './web';

import {SessionDoc, UserDoc, CallDoc, CallDocWithUser, SystemInfo} from '../lib/db';

import * as config from 'config';
import * as randomString from 'random-string';
import * as objectAssign from 'object-assign';

import * as validator from './validator';
import sha256sum from './sha256sum';

import * as WebSocket from 'ws';
import {Promise} from 'es6-promise';

interface CollectionNames{
    system:string;
    session: string;
    user:string;
    call:string;
}


export default class Session{
    private wss:Array<WebSocket>;
    private sessionid:WeakMap<WebSocket,string>;
    private collection:CollectionNames;
    private systemCache:SystemInfo;
    constructor(private db:Db){
        this.wss=[];
        this.sessionid = new WeakMap<WebSocket, string>();
        this.collection = config.get<CollectionNames>("mongodb.collections");
        this.systemCache = null;
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
        let coll = this.db.collection(this.collection.session);
        console.log(obj);
        let command:string = obj.command, sessid:string;;
        if(command!=="session"){
            //セッションチェック
            sessid = this.sessionid.get(ws);
            if(sessid==null){
                //セッションがなかった
                this.sendError(ws, new Error("No Session"));
                return;
            }
        }
        if(command==="session"){
            //セッションを要求
            let getid:Promise<string>;
            if("string"===typeof obj.sessionid){
                getid = coll.findOneAndUpdate({
                    id : obj.sessionid
                },{
                    $set: {
                        time: new Date()
                    }
                }).then((obj)=>{
                    let doc:SessionDoc = obj.value;
                    if(doc==null){
                        //新規のセッションが必要
                        //セキュリティ上の観点から、向こうが要求するセッションIDは使用せず新規のセッションIDを生成
                        return this.makeNewSession();
                    }else{
                        //セッションがあった。
                        if(doc.rojin===true){
                            //老人セッションだ
                            this.navigateRojin(ws, doc.rojin_name);
                        }else if(doc.eccs!=null){
                            //ECCSがあったからユーザーデータを取得
                            this.findUserToNavigate(ws, doc.eccs);
                        }
                        //Typing problem
                        //return doc.id;
                        return Promise.resolve(doc.id);
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
        }else if(command==="login"){
            //セッションにユーザIDを登録
            if(!validator.isECCSID(obj.eccs)){
                this.sendError(ws, new Error("Validation Error"));
                return;
            }
            coll.updateOne({
                id: sessid
            },{
                $set: {
                    eccs: obj.eccs
                }
            }).then((result)=>{
                if(result.result && result.result.n === 0){
                    //セッションがなかった
                    this.sendError(ws, new Error("Session Expired"));
                    this.sessionid.delete(ws);
                }else{
                    this.findUserToNavigate(ws, obj.eccs);
                }
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="logout"){
            //ログアウト
            coll.updateOne({
                id: sessid
            },{
                $set: {
                    eccs: null,
                    rojin: false,
                    rojin_name: ""
                }
            }).then((result)=>{
                this.send(ws,{
                    command: "toppage"
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="entry"){
            //ユーザー情報を登録
            if("string"!==typeof obj.name || "string"!==typeof obj.name_phonetic || "string"!==typeof obj.tel){
                this.sendError(ws, new Error("は？"));
                return;
            }
            this.getUserData(sessid).then(({eccs})=>{
                if(eccs==null){
                    throw new Error("Session Expired");
                }
                let collu = this.db.collection(this.collection.user);
                return collu.updateOne({
                    eccs
                },{
                    $setOnInsert:{
                        eccs
                    },
                    $set:{
                        name: obj.name,
                        name_phonetic: obj.name_phonetic,
                        tel: obj.tel
                    }
                },{
                    upsert: true
                }).then(()=>{
                    return {
                        eccs,
                        name: obj.name,
                        name_phonetic: obj.name_phonetic,
                        tel: obj.tel
                    };
                });
            }).then((user:UserDoc)=>{
                //処理おわり
                this.send(ws,{
                    command: "mainpage",
                    user
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="call"){
            if("number"!==typeof obj.hour || "number"!==typeof obj.minute){
                this.sendError(ws, new Error("は？"));
                return;
            }
            this.getSystemInfo().then((system:SystemInfo)=>{
                return this.getUserData(sessid).then(({eccs})=>{
                    if(eccs==null){
                        throw new Error("Session Expired");
                    }
                    let collc = this.db.collection(this.collection.call);
                    return collc.updateOne({
                        eccs,
                        date: system.date
                    },{
                        $setOnInsert:{
                            eccs,
                            date: system.date
                        },
                        $set:{
                            hour: obj.hour,
                            minute: obj.minute,
                            next_hour: obj.hour,
                            next_minute: obj.minute,
                            snooze: 0,
                            awake: false,
                            confirmed: false,
                            occupied: false,
                            occupied_by: ""
                        }
                    },{
                        upsert: true
                    });
                });
            }).then(()=>{
                //登録成功メッセージを送るぜえええええあ
                this.send(ws, {
                    command: "ok",
                    ack: obj.comid
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="rojin-login"){
            //老人ログイン
            if("string"!==typeof obj.name || "string"!==typeof obj.pass){
                this.sendError(ws, new Error("は？"));
                return;
            }
            this.getSystemInfo().then((system:SystemInfo)=>{
                if(sha256sum(obj.pass) !== system.roujin_pass){
                    throw new Error("パスワードが違います。");
                }
                return coll.updateOne({
                    id: sessid
                },{
                    $set: {
                        rojin: true,
                        rojin_name:obj.name,
                    }
                }).then((result)=>{
                    if(result.result && result.result.n === 0){
                        //セッションがなかった
                        this.sendError(ws, new Error("Session Expired"));
                        this.sessionid.delete(ws);
                    }else{
                        this.navigateRojin(ws, obj.name);

                    }
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="rojin-call"){
            //老人が電話をかけます！！！
            if("string"!==typeof obj.eccs){
                this.sendError(ws, new Error("は？"));
                return;
            }
            this.getSystemInfo().then((system:SystemInfo)=>{
                return this.getUserData(sessid).then(({eccs, rojin, rojin_name})=>{
                    if(rojin===false){
                        throw new Error("Session Expired");
                    }
                    let collc = this.db.collection(this.collection.call);
                    return collc.updateOne({
                        eccs: obj.eccs,
                        date: system.date,
                        awake: false,
                        occupied: false
                    },{
                        $set:{
                            occupied: true,
                            occupied_by: rojin_name
                        }
                    }).then(()=>{
                        this.publish({
                            command: "rojin-call",
                            eccs: obj.eccs,
                            date: system.date,
                            rojin_name
                        });
                    });
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="rojin-call-cancel"){
            //老人が電話をかけるのをやめました！！！！！
            this.getSystemInfo().then((system:SystemInfo)=>{
                return this.getUserData(sessid).then(({eccs, rojin, rojin_name})=>{
                    if(rojin===false){
                        throw new Error("Session Expired");
                    }
                    let collc = this.db.collection(this.collection.call);
                    return collc.updateMany({
                        date: system.date,
                        occupied_by: rojin_name
                    },{
                        $set:{
                            occupied: false,
                            occupied_by: ""
                        }
                    }).then(()=>{
                        this.publish({
                            command: "rojin-call-cancel",
                            date: system.date,
                            rojin_name
                        });
                    });
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="rojin-wake"){
            //老人が電話したら起きました！！！！！
            if("string"!==typeof obj.eccs){
                this.sendError(ws, new Error("は？"));
                return;
            }
            this.getSystemInfo().then((system:SystemInfo)=>{
                return this.getUserData(sessid).then(({eccs, rojin, rojin_name})=>{
                    if(rojin===false){
                        throw new Error("Session Expired");
                    }
                    let collc = this.db.collection(this.collection.call);
                    return collc.updateMany({
                        date: system.date,
                        eccs: obj.eccs,
                    },{
                        $set:{
                            awake: true,
                            confirmed: false,
                            occupied: false,
                            occupied_by: ""
                        }
                    }).then(()=>{
                        this.publish({
                            command: "rojin-wake",
                            date: system.date,
                            eccs: obj.eccs
                        });
                    });
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }
    }
    private publish(obj:any):void{
        //すべてのユーザーに送っちゃうぞーーーーーーーーーーーー
        for(let i=0, wss=this.wss, l=wss.length; i<l; i++){
            this.send(wss[i], obj);
        }
    }
    private makeNewSession():Promise<string>{
        let nid = randomString({length: 20});
        return this.db.collection(this.collection.session).insertOne({
            id: nid,
            eccs: null,
            rojin: false,
            rojin_name: null,
            time: new Date()
        }).then((_)=>{
            return nid;
        });
    }
    //セッションIDからECCS ID
    private getUserData(sessid:string):Promise<SessionDoc>{
        let coll = this.db.collection(this.collection.session);
        return coll.find({
            id: sessid
        }).limit(1).next().then((doc:SessionDoc)=>{
            return doc || {
                eccs: null,
                rojin: false,
                rojin_name: ""
            };
        });
    }
    private getSystemInfo():Promise<SystemInfo>{
        if(this.systemCache != null){
            return Promise.resolve(this.systemCache);
        }else{
            return this.db.collection(this.collection.system).find({
                key: "system"
            }).limit(1).next().then((doc:SystemInfo)=>{
                this.systemCache = doc;
                return doc;
            });
        }
    }
    private findUserToNavigate(ws:WebSocket, eccs:string):void{
        let coll_u = this.db.collection(this.collection.user),
            coll_c = this.db.collection(this.collection.call);
        this.getSystemInfo().then((system:SystemInfo)=>{
            let date=system.date;
            return Promise.all([
                coll_u.find({eccs}).limit(1).next(),
                coll_c.find({date, eccs}).limit(1).next()
            ]);
        }).then(([udoc, cdoc])=>{
            if(udoc==null){
                //ないのでユーザー新規登録ページへ
                this.send(ws, {
                    command: "entrypage",
                    eccs
                });
            }else{
                //あった
                this.send(ws, {
                    command: "mainpage",
                    user: udoc,
                    call: cdoc
                });
                return {};
            }
        })
        .catch((err)=>{
            console.error(err);
        });
    }
    private navigateRojin(ws:WebSocket, rojin_name:string):void{
        //老人のメインページをセッティング
        this.getSystemInfo().then((system:SystemInfo)=>{
            let date = system.date;
            let coll = this.db.collection(this.collection.call);
            return coll.find({
                date,
            }).sort([["awake",1],["next_hour",1], ["next_minute",1],["snooze",-1]]).toArray().then((docs)=>{
                return this.addUserDoc(docs);
            }).then((calls)=>{
                this.send(ws, {
                    command: "rojinpage",
                    rojin_name,
                    calls
                });
            });
        }).catch((err)=>{
            this.sendError(ws,err);
        });
    }
    private addUserDoc(calls:Array<CallDoc>):Promise<Array<CallDocWithUser>>{
        //ECCSを集計
        let eccss:Array<string>=[];
        for(let i=0, l=calls.length; i<l; i++){
            eccss.push(calls[i].eccs);
        }
        let coll = this.db.collection(this.collection.user);
        return coll.find({
            eccs: {
                $in: eccss
            }
        }).toArray().then((docs:Array<UserDoc>)=>{
            //テーブル
            let table=<{[eccs:string]:UserDoc}>{};
            for(let i=0, l=docs.length; i<l; i++){
                table[docs[i].eccs] = docs[i];
            }
            //付加
            return calls.map(call=>
                objectAssign(call, {user: table[call.eccs]})
            );
        });
    }
}
