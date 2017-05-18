///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as objectAssign from 'object-assign';
import {Page} from './index';


import {
    CallDocWithUser,
    RojinMember,
} from '../../../lib/db';

import RojinPass from '../widgets/rojin-pass';

import * as errorActions from '../../action/error';
import * as pageActions from '../../action/page';

//老人メインインターフェース
export default class Rojin extends Page{
    private rojins: Array<RojinMember>;
    constructor(props){
        super(props);
        this.state = {
            sleeping_sort_mode: "time",
            preparing_sort_mode: "time",
            sleeping_show_mode: 'all',
        };
    }
    componentDidUpdate(){
        (this.refs["console-date"] as HTMLInputElement).value = String(this.props.date);
    }
    render(){
        const {date, rojin_name, calls, nocalls} = this.props;

        // 老人情報を読み込み
        if (this.rojins == null){
            this.rojins = JSON.parse(document.getElementById('rojin-data').dataset.rojins);
        }

        //寝ているひとと起きているひとに分割
        const sleepings:Array<CallDocWithUser>=[], preparings:Array<CallDocWithUser>=[];
        let all_sleepings_count = 0;
        for(let i=0, l=calls.length; i<l; i++){
            if(calls[i].awake===false){
                if (this.state.sleeping_show_mode === 'all' || calls[i].assigned === rojin_name){
                    sleepings.push(calls[i]);
                }
                all_sleepings_count++;
            }else if(calls[i].confirmed===false){
                preparings.push(calls[i]);
            }
        }
        if(this.state.sleeping_sort_mode==="phonetic"){
            sleepings.sort((a,b)=>{
                return a.user.name_phonetic < b.user.name_phonetic ? -1 : 1;
            });
        }else{
            sleepings.sort((a,b)=>{
                return (a.next_hour-b.next_hour)*60 + (a.next_minute-b.next_minute);
            });
        }
        if(this.state.preparing_sort_mode==="phonetic"){
            preparings.sort((a,b)=>{
                return a.user.name_phonetic < b.user.name_phonetic ? -1 : 1;
            });
        }else{
            preparings.sort((a,b)=>{
                return (a.next_hour-b.next_hour)*60 + (a.next_minute-b.next_minute);
            });
        }
        // 自分が担当しているやつを探す
        const mine = sleepings.filter(call => call.occupied_by === rojin_name)[0];
        const call_main = mine == null ?
                            null :
                            <section className="rojin-main">
                                <h1>{"\u260e"}電話中</h1>
                                <p><b className="rojin-main-name">{mine.user.name}</b><span className="rojin-main-phonetic">（{mine.user.name_phonetic}）</span></p>
                                <p className="rojin-main-tel">{"\u260e"+mine.user.tel}</p>
                                <p className="rojin-main-time">モーニングコール時刻：<b>{this.time(mine.next_hour, mine.next_minute)}</b></p>
                                <p className="rojin-main-comment">{
                                    mine.comment
                                }</p>
                                <p className="rojin-main-snooze">（スヌーズ：{mine.snooze}回）</p>
                                <div className="rojin-main-buttons">
                                    <p><input type="button" value="起きた" onClick={this.wakeHandler(mine.eccs)}/></p>
                                    <p><input type="button" value="やめる" onClick={this.callCancelHandler()}/></p>
                                </div>
                                <div className="rojin-snooze-buttons">
                                    <p><input type="number" ref="rojin-snooze" min="5" step="5" defaultValue="5" />分後</p>
                                    <p><input type="button" value="スヌーズ" onClick={this.snoozeHandler(mine.eccs)}/></p>
                                </div>
                            </section>;
        // clickable class
        const clcl = (key: string, value: string)=>{
            let result = 'clickable-like';
            if (this.state[key] === value){
                result += ' clickable-like-selected';
            }
            return result;
        };
        // 人数情報
        let ninzu_info;
        if (this.state.sleeping_show_mode === 'all'){
            ninzu_info = <p>
                寝ている人は<b>{sleepings.length}人</b>います。
            </p>;
        }else{
            ninzu_info = <p>
                割り当てられている人は<b>{sleepings.length}人</b>います。
                （寝ている人：<b>{all_sleepings_count}人</b>）
            </p>;
        }
        return <section className="page-rojin">
            <h1>老人ホーム</h1>
            <p>老人ページです。ログイン中：<b>{rojin_name}</b></p>
            <p><a href="/">もどる</a></p>
            <div className="rojin-wrapper">
                <section className="rojin-sleepings">
                    <h1>寝ている人</h1>
                    {call_main}
                    {ninzu_info}
                    <p>
                        <span className={clcl('sleeping_sort_mode', 'time')} onClick={this.handleSortMode("sleeping_sort_mode","time")}>時間でソート</span>｜
                        <span className={clcl('sleeping_sort_mode', 'phonetic')} href="#" onClick={this.handleSortMode("sleeping_sort_mode","phonetic")}>名前でソート</span>
                        {"　　　"}
                        <span className={clcl('sleeping_show_mode', 'mine')} onClick={this.handleSortMode('sleeping_show_mode', 'mine')}>自分に割り当てられた人のみ表示</span>｜
                        <span className={clcl('sleeping_show_mode', 'all')} onClick={this.handleSortMode('sleeping_show_mode', 'all')}>全て表示</span>
                    </p>
                    <div className="rojin-sleepings-box">{
                        this.callList(sleepings,false)
                    }</div>
                </section>
                <section className="rojin-preparings">
                    <h1>起きている人</h1>
                    <p>本部に到着していない人は<b>{preparings.length}人</b>います。
                        <span className="clickable-like" onClick={this.handleSortMode("preparing_sort_mode","time")}>時間でソート</span>｜
                        <span className="clickable-like" href="#" onClick={this.handleSortMode("preparing_sort_mode","phonetic")}>名前でソート</span>
                        </p>
                    <div className="rojin-preparings-box">{
                        this.callList(preparings,true)
                    }</div>
                </section>
            </div>
            <section className="rojin-uncall">
                <h1>登録していない人</h1>
                <p><span className="clickable-like" onClick={this.handleUncallRequest()}>情報を更新</span>（ここは自動で変化しません）</p>
                <p>{
                    nocalls && nocalls.map(m => m.name_phonetic).join("、")
                }</p>
            </section>
            <form onSubmit={this.handleConsoleSubmit()}>
                <section className="rojin-console">
                    <h1>管理コンソール</h1>
                    <details>
                        <summary>開く</summary>
                        <p>管理者パスワード：
                            <input ref="console-pass" type="password" />
                        </p>
                        <section>
                            <h1>老人パスワードの変更</h1>
                            <p><input ref="console-new-password1" type="password" placeholder="新しい老人パスワード" /></p>
                            <p><input ref="console-new-password2" type="password" placeholder="再入力" /></p>
                        </section>
                        <section>
                            <h1>日付の変更</h1>
                            <p><input ref="console-date" type="number" defaultValue={String(date)}/></p>
                        </section>
                        <p><input type="submit" value="送信"/></p>
                    </details>
                </section>
            </form>
        </section>;
    }
    private callList(list:Array<CallDocWithUser>,awake:boolean){
        const makeRojinForm = (call: CallDocWithUser)=>{
            if (!this.props.rojin_leader){
                const rojin_name = call.assigned || 'なし';
                return <p>担当老人：{rojin_name}</p>;
            }
            return <p>担当老人：<select defaultValue={call.assigned || ''} className="rojin-assign-select" onClick={this.assignHandler(call.eccs)}>
                <option value="">なし</option>
                {
                    this.rojins.map(({name})=>{
                        return <option key={name} value={name}>{name}</option>;
                    })
                }
            </select></p>
        };
        return list.map((call)=>{
            let call_btn = null;
            if(call.occupied === false){
                if(call.awake === false){
                    call_btn = <div className="rojin-call-buttons">
                        <p><input type="button" value="電話をかける" className="rojin-call-button-call" onClick={this.callHandler(call.eccs)}/></p>
                        <p><input type="button" value="本部に来た" className="rojin-call-button-confirm" onClick={this.confirmHandler(call.eccs)}/></p>
                    </div>;
                }else{
                    call_btn = <div className="rojin-call-buttons">
                        <p><input type="button" value="本部に来た" className="rojin-call-button-confirm" onClick={this.confirmHandler(call.eccs)}/></p>
                    </div>;
                }
            }
            return <div key={call.eccs} className="rojin-call-obj">
                <div className="rojin-call-obj-name">{call.user.name}</div>
                <div className="rojin-call-obj-info">
                    <p>モーニングコール時刻：<b className="rojin-call-obj-time">{this.time(call.next_hour, call.next_minute)}</b>　<small>（スヌーズ：{call.snooze}回）</small></p>
                    <p className="rojin-call-obj-comment">{
                        call.comment
                    }</p>
                    { call.occupied ? <p>電話中：<b>{call.occupied_by}</b></p> : null}
                    {makeRojinForm(call)}
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
    private wakeHandler(eccs:string){
        //電話したら起きたときのボタン
        return (e)=>{
            this.props.ws.send({
                command: "rojin-wake",
                eccs
            });
        };
    }
    private confirmHandler(eccs:string){
        //本部に来た（任務完了）ボタン
        return (e)=>{
            this.props.ws.send({
                command: "rojin-confirm",
                eccs
            });
        };
    }
    private snoozeHandler(eccs:string){
        //スヌーズボタン
        return (e)=>{
            this.props.ws.send({
                command: "rojin-snooze",
                eccs,
                snooze: Number((ReactDOM.findDOMNode(this.refs["rojin-snooze"]) as HTMLInputElement).value)
            });
        };
    }
    private handleConsoleSubmit(){
        return (e)=>{
            e.preventDefault();
            let adminpass   = (ReactDOM.findDOMNode(this.refs["console-pass"]) as HTMLInputElement).value,
                password1 = (ReactDOM.findDOMNode(this.refs["console-new-password1"]) as HTMLInputElement).value,
                password2 = (ReactDOM.findDOMNode(this.refs["console-new-password2"]) as HTMLInputElement).value,
                date      = Number((ReactDOM.findDOMNode(this.refs["console-date"]) as HTMLInputElement).value) || 0;
            if(password1 !== password2){
                errorActions.error(new Error("パスワードが一致しません。"));
            }
            this.props.ws.send({
                command: "rojin-console",
                adminpass,
                password: password1,
                date
            });

        };
    }
    private handleSortMode(key:string, mode:string){
        return (e)=>{
            e.preventDefault();
            this.setState({
                ... this.state,
                [key]: mode,
            });
        };
    }
    private handleUncallRequest(){
        return (e)=>{
            e.preventDefault();
            this.props.ws.send({
                command: "rojin-request-members"
            }).then(({members})=>{
                pageActions.gotNocall({
                    nocalls: members
                });
            });
        };
    }
    private assignHandler(eccs:string){
        //フリーのときに起こすボタンを押した
        return (e: React.SyntheticEvent<HTMLSelectElement>)=>{
            // 選択された老人
            const rojin_name = e.currentTarget.value;
            //こいつを起こしたい！！！！！！！！！！！！！！
            this.props.ws.send({
                command: "rojin-assign",
                eccs,
                rojin_name,
            });
        };
    }
}

