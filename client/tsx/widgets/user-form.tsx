///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {UserDoc} from '../../../lib/db';

//ユーザー情報
export default class UserForm extends React.Component<{
    system?:boolean;
    user?: UserDoc;
    onSubmit:(user:UserDoc)=>void;
},{}>{
    render(){
        let user=this.props.user || {
            eccs: null,
            name: null,
            name_phonetic:null,
            tel: null
        };
        let sysinfo = this.props.system===true ?
            <p>ウェブシステムから情報を自動で取得しました。</p> :
            null;
        return <form onSubmit={this.handleSubmit()}>
            <p>ECCSユーザID: <b>{user.eccs}</b></p>
            {sysinfo}
            <p>氏名：
                <input ref="name" type="text" required placeholder="小松けろ" defaultValue={user.name}/>
            </p>
            <p>ふりがな：
                <input ref="name_phonetic" type="text" required placeholder="こまっけろ" defaultValue={user.name_phonetic}/>
            </p>
            <p>電話番号：
                <input ref="tel" type="tel" required defaultValue={user.tel}/>
            </p>
            <p>
                <input type="submit" value="登録"/>
            </p>
        </form>;
    }
    private handleSubmit(){
        return (e)=>{
            e.preventDefault();
            let user:UserDoc = {
                eccs: (this.props.user ? this.props.user.eccs : null),
                name: (ReactDOM.findDOMNode(this.refs["name"]) as HTMLInputElement).value,
                name_phonetic: (ReactDOM.findDOMNode(this.refs["name_phonetic"]) as HTMLInputElement).value,
                tel: (ReactDOM.findDOMNode(this.refs["tel"]) as HTMLInputElement).value,
                record: 0
            };
            if(this.props.onSubmit){
                this.props.onSubmit(user);
            }
        };
    }
}
