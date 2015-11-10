///<reference path="../typings/bundle.d.ts" />
import Db from './db';

import config=require('config');
import express=require('express');
import ejs=require('ejs');
import {Promise} from 'es6-promise';

export default class Web{
    private db:Db;
    private app:express.Express;
    constructor(){
    }
    init(db:Db):Promise<Web>{
        this.db = db;
        let app = this.app = express();

        app.use("/static", express.static("dist", {
            dotfiles: "ignore",
            etag: true,
            extensions: [],
            index: false,
            lastModified: true,
            maxAge: 0,
            redirect: true,
        }));
        this.initRoute();
        app.listen(config.get("webserver.port"));

        return Promise.resolve(this);
    }
    private initRoute():void{
        let app=this.app;
        app.get("/",(req,res)=>{
            res.render("index.ejs");
        });
    }
}
