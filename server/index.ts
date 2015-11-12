import Db from './db';
import Web from './web';

import {Promise} from 'es6-promise';

export default class Index{
    private db:Db;
    private web:Web;
    constructor(){
    }
    public init():Promise<boolean>{
        this.db = new Db();
        return this.db.init()
        .then((_)=>{
            this.web = new Web();
            return this.web.init(this.db);
        })
        .then((web)=>{
            console.log("server is working");
            return true;
        }).catch((err)=>{
            console.error(err);
            return false;
        });
    }
}
