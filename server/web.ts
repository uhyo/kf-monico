///<reference path="../typings/bundle.d.ts" />
///<reference path="../typings/express-ws.d.ts" />
import Db from './db';
import Session from './session';

import config=require('config');
import * as express from 'express';
import * as expressWs from 'express-ws';
import * as ejs from 'ejs';
import * as WebSocket from 'ws';
import {Promise} from 'es6-promise';



export default class Web{
    private db:Db;
    private session:Session;
    private app:express.Express;
    constructor(){
    }
    init(db:Db):Promise<Web>{
        this.db = db;   //DBを受け取った
        this.session = new Session(db); //セッション管理を作る
        //まずセッション管理を初期化してから
        return this.session.init().then(()=>{
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

            return this;
        });
    }
    private initRoute():void{
        let app=this.app, session=this.session;
        let basepath = config.get<string>("webserver.basepath");
        app.get("*",(req,res)=>{
            res.render("index.ejs",{
                basepath
            });
        });
        (app as any).ws("/",(ws:WebSocket,req)=>{
            //WebSocketが来たらsessionに任せる
            session.add(ws);
        });
    }
}
