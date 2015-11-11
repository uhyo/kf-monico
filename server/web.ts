///<reference path="../typings/bundle.d.ts" />
///<reference path="../typings/express-ws.d.ts" />
import Db from './db';

import config=require('config');
import * as express from 'express';
import * as expressWs from 'express-ws';
import * as ejs from 'ejs';
import * as WebSocket from 'ws';
import {Promise} from 'es6-promise';



export default class Web{
    private db:Db;
    private app:express.Express;
    constructor(){
    }
    init(db:Db):Promise<Web>{
        this.db = db;
        let app = this.app = express();
        expressWs(app);

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
        (app as any).ws("/",(ws:WebSocket,req)=>{
            ws.send("foo");
            ws.on("message",(mes)=>{
                ws.send("Hello "+mes);
                ws.close();
            });
            ws.on("close",()=>{
                console.log("ws closed");
            });
        });
    }
}
