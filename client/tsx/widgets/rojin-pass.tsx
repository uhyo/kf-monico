///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Ws from '../../lib/ws';

export default class RojinPass extends React.Component<{
    onSubmit:(obj:{
        name:string;
        pass:string;
    })=>void;
},{}>{
    render(){
        return <form onSubmit={this.submitHandler()}>
            <p>おなまえ</p>
            <p><input ref="name" type="text" required placeholder="てらだ"/></p>
            <p>老人パスワードを入力してください：</p>
            <p><input ref="pass" type="password" required/></p>
            <p><input type="submit" value="老人ログイン" /></p>
        </form>;
    }
    private submitHandler(){
        return (e)=>{
            e.preventDefault();
            this.props.onSubmit({
                name: (ReactDOM.findDOMNode(this.refs["name"]) as HTMLInputElement).value,
                pass: (ReactDOM.findDOMNode(this.refs["pass"]) as HTMLInputElement).value
            });
        };
    }
}

