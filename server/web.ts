import Db from './db';
import Session from './session';

import config=require('config');
import * as express from 'express';
import * as http from 'http';
import * as ejs from 'ejs';
import * as WebSocket from 'ws';
import * as socketIO from 'socket.io';
import {Promise} from 'es6-promise';



export default class Web{
    private db:Db;
    private session:Session;
    private app:express.Express;
    private io:any;
    constructor(){
    }
    init(db:Db):Promise<Web>{
        this.db = db;   //DBを受け取った
        this.session = new Session(db); //セッション管理を作る
        //まずセッション管理を初期化してから
        return this.session.init().then(()=>{
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

            return this;
        });
    }
    private initRoute():void{
        let app=this.app, session=this.session;
        let basepath = config.get<string>("webserver.basepath");
        app.get("/*",(req,res)=>{
            res.render("index.ejs",{
                basepath,
                rojins: session.rojins,
            });
        });

        let srv = http.createServer(app);
        let io = socketIO(srv);
        io.on("connection",(ws)=>{
            session.add(ws);
        });

        srv.listen(config.get("webserver.port"));
    }
}
