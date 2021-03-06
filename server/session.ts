//クライアントとの　接　続　を一挙に管理するひとだ

import Db from './db';
import Web from './web';
import {
    loadCommitteeMembersData,
    loadRojinData,
} from './members';

import {SessionDoc, UserDoc, CallDoc, CallDocWithUser, SystemInfo, CommitteeMember, RojinMember} from '../lib/db';

import * as config from 'config';
import * as randomString from 'random-string';
import * as objectAssign from 'object-assign';
import * as WebSocket from 'ws';

import * as validator from './validator';
import sha256sum from './sha256sum';

import {Promise} from 'es6-promise';

interface CollectionNames{
    system:string;
    session: string;
    user:string;
    call:string;
}


export default class Session{
    private wss:Array<any>;
    private sessionid:WeakMap<any,string>;
    private collection:CollectionNames;
    private systemCache:SystemInfo;
    private members:Array<CommitteeMember>;
    public rojins: Array<RojinMember>;
    constructor(private db:Db){
        this.wss=[];
        this.sessionid = new WeakMap<any, string>();
        this.collection = config.get<CollectionNames>("mongodb.collections");
        this.systemCache = null;
    }
    init():Promise<{}>{
        return loadCommitteeMembersData().then((data)=>{
            this.members = data;
        }).then(loadRojinData).then((data)=>{
            this.rojins = data;
            return {};
        });
    }
    //wsファミリに追加された
    add(ws:any):void{
        this.wss.push(ws);
        ws.on("message",(obj)=>{
            /* JSONで表されるものを受け取る */
            if(obj.comid != null && "number"!==typeof obj.comid){
                //comidに変な値を渡されても困る
                throw new Error("Invalid comid");
            }
            this.command(ws, obj);
        });
        ws.on("disconnect",()=>{
            //wsがcloseされた
            ws.removeAllListeners();
            this.remove(ws);
        });
    }
    //もういない
    remove(ws:any):void{
        this.wss = this.wss.filter(w => w!==ws);
    }
    //オブジェクトを送る
    send(ws:any,obj:any):void{
        ws.emit("message",obj);
    }
    sendError(ws:WebSocket,err:Error):void{
        this.send(ws,{
            command: "error",
            error: err.message || String(err)
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
                            this.navigateRojin([{
                                ws,
                                rojin_name: doc.rojin_name,
                                rojin_leader: doc.rojin_leader,
                            }]);
                        }else if(doc.eccs!=null){
                            //ECCSがあったからユーザーデータを取得
                            this.findUserToNavigate(ws, doc.eccs, obj.comid);
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
                    this.findUserToNavigate(ws, obj.eccs, obj.comid);
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
        }else if(command==="request-home"){
            //ホームを要求
            this.getUserData(sessid).then(({eccs})=>{
                if(eccs==null){
                    //トップへとばす
                    this.send(ws,{
                        command: "toppage"
                    });
                }else{
                    this.findUserToNavigate(ws, eccs, obj.comid);
                }
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="request-entry"){
            //プロフィール登録ページを要求
            this.getUserData(sessid).then(({eccs})=>{
                if(eccs==null){
                    throw new Error("Session Expired");
                }
                let collu = this.db.collection(this.collection.user);
                return collu.find({
                    eccs
                }).limit(1).next().then((doc:UserDoc)=>{
                    if(doc==null){
                        //ユーザー登録はまだみたいですね……
                        this.send(ws, {
                            command: "entrypage",
                            eccs
                        });
                    }else{
                        //データあった
                        this.send(ws, {
                            command: "entrypage",
                            eccs,
                            user: doc
                        });
                    }
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
                        eccs,
                        record: 0
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
                this.findUserToNavigate(ws, user.eccs, obj.comid);
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="call"){
            if("number"!==typeof obj.hour || "number"!==typeof obj.minute || "string"!==typeof obj.comment){
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
                            comment: obj.comment,
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
                //老人に通知（てきとう）
                this.refreshAllRojin();
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
                console.log(this.rojins);
                const rojinObj = this.rojins.filter(({name})=> name === obj.name)[0];
                const rojin_leader = rojinObj != null && rojinObj.leader;
                return coll.updateOne({
                    id: sessid
                },{
                    $set: {
                        rojin: true,
                        rojin_name:obj.name,
                        rojin_leader,
                    }
                }).then((result)=>{
                    if(result.result && result.result.n === 0){
                        //セッションがなかった
                        this.sendError(ws, new Error("Session Expired"));
                        this.sessionid.delete(ws);
                    }else{
                        this.navigateRojin([{
                            ws,
                            rojin_name: obj.name,
                            rojin_leader,
                        }]);
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
        }else if(command==="rojin-confirm"){
            //誰かが本部に来た
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
                    return collc.findOneAndUpdate({
                        date: system.date,
                        eccs: obj.eccs,
                    },{
                        $set:{
                            awake: true,
                            confirmed: true,
                            occupied: false,
                            occupied_by: ""
                        }
                    }).then(({value}:{value:CallDoc})=>{
                        //現在時刻とモニコ時刻の差をとる
                        const now = new Date();
                        const now_hour = now.getHours(), now_minute = now.getMinutes();
                        let diff = (now_hour - value.hour) * 60 + (now_minute - value.minute);
                        if(diff<0){
                            diff = 0;
                        }
                        let coll_u = this.db.collection(this.collection.user);
                        return coll_u.updateOne({
                            eccs: obj.eccs,
                        },{
                            $set: {
                                record: diff
                            }
                        });
                    }).then(()=>{
                        this.publish({
                            command: "rojin-confirm",
                            date: system.date,
                            eccs: obj.eccs
                        });
                    });
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="rojin-snooze"){
            //もっと寝たい
            if("number"!==typeof obj.snooze){
                this.sendError(ws, new Error("は？"));
                return;
            }
            let collc = this.db.collection(this.collection.call);
            this.getSystemInfo().then((system:SystemInfo)=>{
                return this.getUserData(sessid).then(({eccs, rojin, rojin_name})=>{
                    if(rojin===false){
                        throw new Error("Session Expired");
                    }
                    return collc.find({
                        date: system.date,
                        eccs: obj.eccs,
                    }).limit(1).next().then((call: CallDoc)=>{
                        if(call==null){
                            throw new Error("は？");
                        }
                        //n分進める
                        let {next_hour, next_minute} = call;
                        next_minute += obj.snooze;
                        while(next_minute >= 60){
                            next_hour++;
                            next_minute -= 60;
                        }
                        return {date:system.date, eccs: obj.eccs, next_hour, next_minute};
                    });
                });
            }).then(({date, eccs, next_hour, next_minute})=>{
                //アップデート
                return collc.updateOne({
                    date,
                    eccs
                },{
                    $set: {
                        occupied: false,
                        occupied_by: "",
                        next_hour,
                        next_minute
                    },
                    $inc: {
                        snooze: 1
                    }
                }).then(()=>{
                    this.publish({
                        command: "rojin-snooze",
                        date,
                        eccs,
                        next_hour,
                        next_minute
                    });
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="rojin-request-members"){
            //まだ登録していないメンバーを要求
            let collc = this.db.collection(this.collection.call);
            this.getSystemInfo().then((system:SystemInfo)=>{
                return this.getUserData(sessid).then(({eccs, rojin, rojin_name})=>{
                    if(rojin===false){
                        throw new Error("Session Expired");
                    }
                    return collc.find({
                        date: system.date,
                    }).project({
                        eccs: 1
                    }).toArray().then((docs:Array<CallDoc>)=>{
                        //O(n^2)じゃん
                        return this.addUserDoc(docs).then((docs:Array<CallDocWithUser>)=>{
                            const names = docs.map(d => d.user.name.replace(/\s/,""));
                            const phos = docs.map(d => d.user.name_phonetic.replace(/\s/,""));
                            let mems = this.members.filter((m:CommitteeMember)=>{
                                return names.indexOf(m.name)===-1 && phos.indexOf(m.name_phonetic)===-1;
                            });
                            return mems;
                        });
                    });
                });
            }).then((members:Array<CommitteeMember>)=>{
                this.send(ws,{
                    command: "uncalled-membrs",
                    members,
                    ack: obj.comid
                });
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="rojin-console"){
            //老人管理コンソール
            if(obj.password!=null && "string"!==typeof obj.password || "string" !== typeof obj.adminpass || obj.date!=null && "number"!==typeof obj.date){
                this.sendError(ws, new Error("は？"));
                return;
            }
            if(config.get<string>("system.admin_pass") !== obj.adminpass){
                this.sendError(ws, new Error("管理パスワードが違います。"));
                return;
            }
            //設定
            let coll_s = this.db.collection(this.collection.system);
            let update_obj:any = {
            }, flag = false;
            if(obj.password){
                flag=true;
                update_obj.roujin_pass = sha256sum(obj.password);
            }
            if(obj.date != null){
                flag=true;
                update_obj.date = obj.date;
            }
            let p = flag===false ? Promise.resolve({}) :
                coll_s.updateOne({
                    key: "system"
                },{
                    $set: update_obj
                });
            p.then(()=>{
                this.systemCache = null;
                this.send(ws, {
                    command: "ok",
                    ack: obj.comid
                });
                this.refreshAllRojin();
            }).catch((err)=>{
                this.sendError(ws, err);
            });
        }else if(command==="rojin-assign"){
            // 老人の割り当て
            const {
                eccs,
                rojin_name,
            } = obj;
            if ('string' !== typeof eccs || 'string' !== typeof rojin_name){
                this.sendError(ws, new Error('は？'));
                return;
            }
            this.getSystemInfo().then((system:SystemInfo)=>{
                return this.getUserData(sessid).then(({eccs, rojin})=>{
                    if(rojin===false){
                        throw new Error("Session Expired");
                    }
                    let collc = this.db.collection(this.collection.call);
                    return collc.updateOne({
                        eccs: obj.eccs,
                        date: system.date,
                        awake: false,
                    },{
                        $set:{
                            assigned: rojin_name,
                        }
                    }).then(()=>{
                        this.publish({
                            command: "rojin-assign",
                            eccs: obj.eccs,
                            date: system.date,
                            rojin_name,
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
    private findUserToNavigate(ws:WebSocket, eccs:string, ack:number):void{
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
                //ウェブシステムからユーザー情報を探してあげる
                return this.findUserFromWebSystem(eccs).then((udoc:UserDoc)=>{
                    this.send(ws, {
                        command: "entrypage",
                        eccs,
                        system: udoc!=null,
                        user: udoc,
                        ack
                    });
                    return {};
                });
            }else{
                //あった
                this.send(ws, {
                    command: "mainpage",
                    user: udoc,
                    call: cdoc,
                    ack
                });
                return {};
            }
        })
        .catch((err)=>{
            this.sendError(ws, err);
        });
    }
    private findUserFromWebSystem(eccs:string):Promise<UserDoc>{
        return this.db.connect(config.get<any>("system-db")).then((db)=>{
            return db.collection("user").find({
                eccs_id: eccs
            }).limit(1).next().then((doc)=>{
                if(doc==null){
                    return null;
                }else{
                    return {
                        eccs,
                        name: doc.name_last+doc.name_first,
                        name_phonetic: doc.name_last_phonetic+doc.name_first_phonetic,
                        tel: doc.cellphone,
                        record: 0
                    };
                }
            });
        });
    }
    private navigateRojin(rojins:Array<{
        ws:WebSocket;
        rojin_name:string;
        rojin_leader: boolean;
    }>):void{
        //老人のメインページをセッティング
        this.getSystemInfo().then((system:SystemInfo)=>{
            let date = system.date;
            let coll = this.db.collection(this.collection.call);
            return coll.find({
                date,
            }).sort([["next_hour",1], ["next_minute",1],["snooze",-1]]).toArray().then((docs)=>{
                return this.addUserDoc(docs);
            }).then((calls)=>{
                for(let i=0, l=rojins.length; i<l; i++){
                    const {ws, rojin_name, rojin_leader} = rojins[i];
                    this.send(ws, {
                        command: "rojinpage",
                        date,
                        rojin_name,
                        rojin_leader,
                        calls
                    });
                }
            });
        }).catch((err)=>{
            console.error(err);
        });
    }
    private refreshAllRojin():void{
        let coll = this.db.collection(this.collection.session);
        coll.find({
            rojin: true
        }).project({
            id: 1,
            rojin_name: 1
        }).toArray().then((docs:Array<SessionDoc>)=>{
            //テーブルをつくる
            let table = <{[sessid:string]:[string,boolean]}>{};
            for(let i=0, l=docs.length; i<l; i++){
                let {id, rojin_name, rojin_leader} = docs[i];
                table[id]=[rojin_name, rojin_leader];
            }
            //老人をあつめた
            this.navigateRojin(this.wss.map((ws)=>{
                let sessid = this.sessionid.get(ws);
                if(sessid && table[sessid]){
                    return {
                        ws,
                        rojin_name: table[sessid][0],
                        rojin_leader: table[sessid][1],
                    };
                }else{
                    return null;
                }
            }).filter(obj => obj!=null));
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
