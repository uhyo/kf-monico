///<reference path="../typings/bundle.d.ts" />
import config=require('config');
import mongodb=require('mongodb');

import {Promise} from 'es6-promise';

export interface SessionDoc{
    id:string;
    eccs:string;
    rojin:boolean;
    rojin_name:string;
    time:Date;
}

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
        let coll = db.collection(config.get<string>("mongodb.collections.session"));
        return Promise.all([
            coll.createIndex({
                id: 1
            },{
                unique: true
            }),
            coll.createIndex({
                time: 1
            },{
                expireAfterSeconds: config.get<number>("session.life")
            })
        ]);
    }
}
