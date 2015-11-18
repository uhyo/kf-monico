///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page} from './index';

import {CallDocWithUser} from '../../../lib/db';

import RojinPass from '../widgets/rojin-pass';

//老人メインインターフェース
export default class Rojin extends Page{
    constructor(props){
        super(props);
    }
    render(){
        let {rojin_name, sleepings, preparings} = this.props;

        // 自分が担当しているやつを探す
        let mine = sleepings.filter(call => call.occupied_by === rojin_name)[0];
        console.log(mine);
        let call_main = mine == null ?
                            null :
                            <div className="rojin-main">
                                <p>{"\u260e"}電話中</p>
                                <p className="rojin-main-name">{mine.user.name}</p>
                                <p className="rojin-main-phonetic">（{mine.user.name_phonetic}）</p>
                                <p className="rojin-main-tel">{mine.user.tel}</p>
                                <p className="rojin-main-time">モーニングコール時刻：{this.time(mine.next_hour, mine.next_minute)}</p>
                                <p>
                                    <input type="button" value="起きた"/>
                                    <input type="button" value="やめる" onClick={this.callCancelHandler()}/>
                                </p>
                            </div>;
        return <section className="page-rojin">
            <h1>老人ホーム</h1>
            <p>老人ページです。</p>
            <div>
                <section>
                    <h1>寝ている人</h1>
                    {call_main}
                    <p>寝ている人は<b>{sleepings.length}人</b>います。</p>
                    <div className="rojin-sleepings">{
                        this.callList(sleepings,false)
                    }</div>
                </section>
                <section>
                    <h1>起きている人</h1>
                    <p>本部に到着していない人は<b>{preparings.length}人</b>います。</p>
                    <div className="rojin-preparings">{
                        this.callList(preparings,true)
                    }</div>
                </section>
            </div>
            <p><a href="/">もどる</a></p>
        </section>;
    }
    private callList(list:Array<CallDocWithUser>,awake:boolean){
        return list.map((call)=>{
            let call_btn = null;
            if(call.occupied === false){
                if(call.awake === false){
                    call_btn = <div>
                        <p><input type="button" value="電話をかける" onClick={this.callHandler(call.eccs)}/></p>
                        <p><input type="button" value="本部に来た" /></p>
                    </div>;
                }else{
                    call_btn = <div>
                        <p><input type="button" value="本部に来た" /></p>
                    </div>;
                }
            }
            return <div key={call.eccs} className="rojin-call-obj">
                <div className="rojin-call-obj-name">{call.user.name}</div>
                <div className="rojin-call-obj-info">
                    <p>モーニングコール時刻：<b>{this.time(call.next_hour, call.next_minute)}</b>　<small>（スヌーズ：{call.snooze}回）</small></p>
                    <p>担当老人：{call.occupied ? call.occupied_by : "なし"}</p>
                </div>
                {call_btn}
            </div>;
        });
    }
    private time(hour:number, minute:number){
        let hs = ("0"+hour).slice(-2), mn = ("0"+minute).slice(-2),
            str = hs+":"+mn;
        return <time dateTime={str}>{str}</time>;
    }
    private callHandler(eccs:string){
        //フリーのときに起こすボタンを押した
        return (e)=>{
            //こいつを起こしたい！！！！！！！！！！！！！！
            this.props.ws.send({
                command: "rojin-call",
                eccs
            });
        };
    }
    private callCancelHandler(){
        //やめるボタン（今起こしている人を開放）
        return (e)=>{
            this.props.ws.send({
                command: "rojin-call-cancel"
            });
        };
    }
}

