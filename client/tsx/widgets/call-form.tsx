///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {UserDoc, CallDoc, CallEntry} from '../../../lib/db';

//ユーザー情報
export default class CallForm extends React.Component<{
    user?: UserDoc;
    call?: CallEntry;
    onSubmit:(call:CallEntry)=>void;
},{}>{
    render(){
        let call:CallEntry=this.props.call || {
            hour: null,
            minute: null,
            comment: null
        };
        let mn = this.props.user && this.props.user.record ? <p>
            前回のモーニングコールから本部到着までの所要時間は<strong>{this.props.user.record}分</strong>です。
        </p> : null;
        return <form onSubmit={this.handleSubmit()}>
            <p>モーニングコールの時刻を入力してください。</p>
            {mn}
            <p className="main-call-form-time">
                <select ref="hour" defaultValue={call.hour && String(call.hour)}>{this.makeNumopts(0,23)}</select>
                時
                <select ref="minute" defaultValue={call.minute && String(call.minute)}>{this.makeNumopts(0,59)}</select>
                分
            </p>
            <p className="main-call-form-comment">
                <textarea ref="comment" placeholder="備考" defaultValue={call.comment}/>
            </p>
            <p>
                <input type="submit" value="登録"/>
            </p>
        </form>;
    }
    private makeNumopts(min:number,max:number){
        let result=[];
        for(let i=min;i<=max;i++){
            result.push(<option key={i} value={String(i)}>{i}</option>);
        }
        return result;
    }
    private handleSubmit(){
        return (e)=>{
            e.preventDefault();
            let call:CallEntry = {
                hour: Number((ReactDOM.findDOMNode(this.refs["hour"]) as HTMLSelectElement).value),
                minute: Number((ReactDOM.findDOMNode(this.refs["minute"]) as HTMLSelectElement).value),
                comment: (ReactDOM.findDOMNode(this.refs["comment"]) as HTMLSelectElement).value,
            };
            if(this.props.onSubmit){
                this.props.onSubmit(call);
            }
        };
    }
}

