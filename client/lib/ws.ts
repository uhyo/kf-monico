//ws with server

export default class Ws{
    private ws:WebSocket;
    constructor(){
    }
    init():void{
        let ws = this.ws = new WebSocket(location.origin.replace(/^http/,"ws")+"/");
        ws.addEventListener("error",(e)=>{
            console.error(e);
        });
        ws.addEventListener("open",(e)=>{
            ws.send("ping");
            setTimeout(()=>{ws.close(1000)}, 1500);
        });
        ws.addEventListener("close",(e)=>{
            console.log("clooosed");
        });
        ws.addEventListener("message",(e)=>{
            console.log("mes",e.data);
        });
    }
}
