import Ws from '../lib/ws';
import * as pageActions from '../action/page';
export default function links(ws:Ws):void{
    //リンクを踏んだときの処理をきめる
    document.addEventListener("click",(e)=>{
        let t = e.target as /* HTMLAnchorElement */ any;
        if(t.tagName==="A"){
            if(t.origin===location.origin){
                let p = t.pathname;
                //特定のリンクに飛ぶときはかわりにサーバーにアレする
                if(p==="/"){
                    ws.send({
                        command: "logout"
                    });
                    e.preventDefault();
                }else if(p==="/rojin"){
                    pageActions.rojinTop({});
                    e.preventDefault();
                }
            }
        }
    },false);
}
