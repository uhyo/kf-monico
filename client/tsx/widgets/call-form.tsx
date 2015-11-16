///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {CallDoc, CallEntry} from '../../../lib/db';

//ユーザー情報
export default class CallForm extends React.Component<{
    call?: CallEntry;
    onSubmit:(call:CallEntry)=>void;
},{}>{
    render(){
        let call:CallEntry=this.props.call || {
            hour: null,
            minute: null
        };
        return <form onSubmit={this.handleSubmit()}>
            <p>モーニングコールの時刻を入力してください。</p>
            <p>
                <select ref="hour">{this.makeNumopts(0,23)}</select>
                時
                <select ref="minute">{this.makeNumopts(0,59)}</select>
                分
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
            };
            if(this.props.onSubmit){
                this.props.onSubmit(call);
            }
        };
    }
}

