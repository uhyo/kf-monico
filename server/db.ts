///<reference path="../typings/bundle.d.ts" />
import config=require('config');
import mongodb=require('mongodb');

import {Promise} from 'es6-promise';

import {SessionDoc, UserDoc} from '../lib/db';

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
            coll_u = db.collection(config.get<string>("mongodb.collections.user"));
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
            })
        ]);
    }
}
