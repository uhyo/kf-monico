///<reference path="../typings/bundle.d.ts" />
import config=require('config');
import mongodb=require('mongodb');

import {Promise} from 'es6-promise';

import {SessionDoc, UserDoc, SystemInfo} from '../lib/db';

import sha256sum from './sha256sum';

export default class Db{
    private db:/*mongodb.Db*/ any;
    constructor(){
    }
    init():Promise<{}>{
        let mb = config.get<any>("mongodb");
        return (mongodb.MongoClient as any).connect(`mongodb://${mb.username}:${mb.password}@${mb.host}:${mb.port}/${mb.database}`)
        .then((db)=>{
            this.db=db;
            return db;
        })
        .then((db)=>{
            //各種コレクションを初期化
            return Promise.all([
                this.initSession(db)
            ]).then(()=>{
                return {};
            });
        })
    }
    collection(name:string):/*mongodb.Collection*/any{
        return this.db.collection(name);
    }
    //コレクションの初期化
    private initSession(db:any):Promise<{}>{
        let coll_s = db.collection(config.get<string>("mongodb.collections.session")),
            coll_u = db.collection(config.get<string>("mongodb.collections.user")),
            coll_c = db.collection(config.get<string>("mongodb.collections.call")),
            coll_sys=db.collection(config.get<string>("mongodb.collections.system"));
        return Promise.all([
            coll_s.createIndex({
                id: 1
            },{
                unique: true
            }),
            coll_s.createIndex({
                time: 1
            },{
                expireAfterSeconds: config.get<number>("session.life")
            }),
            coll_u.createIndex({
                eccs: 1
            },{
                unique: true
            }),
            coll_c.createIndex({
                date: 1,
                eccs: 1
            },{
                unique: true
            }),
            coll_c.createIndex({
                date: 1,
                next_hour: 1,
                next_minute: 1,
                snooze: -1
            }),
            coll_sys.createIndex({
                key: 1
            },{
                unique: true
            }),
            this.initSys()
        ]);
    }
    private initSys():Promise<any>{
        let coll_sys=this.db.collection(config.get<string>("mongodb.collections.system"));
        return coll_sys.find({
            key:"system"
        }).limit(1).next().then((doc:SystemInfo)=>{
            if(doc!=null){
                return {};
            }else{
                //いれる
                return coll_sys.insertOne({
                    date: (new Date()).getDate()+1,
                    roujin_pass: sha256sum(config.get<string>("system.roujin_pass")),
                    key: "system"
                });
            }
        });
    }
}
