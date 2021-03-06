///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Ws from '../../lib/ws';

import * as sessionActions from '../../action/session';

//最初のECCSユーザIDを入力してもらう場面
export default class EccsForm extends React.Component<{
    ws: Ws
},{}>{
    render(){
        return <form onSubmit={this.submitHandler()}>
            <p><strong>ECCSユーザIDを入力してください</strong>：</p>
            <p>（社会人の方は覚えていれば学生時代のものを入力してください。忘れた場合は適当に10桁入力してください。）</p>
            <p><input ref="eccs" type="text" required placeholder="1234567890" pattern="\\d{10}" title="10桁のECCSユーザIDを入力してください。"/></p>
            <p><input type="submit" value="ログイン" /></p>
        </form>;
    }
    private submitHandler(){
        return (e)=>{
            e.preventDefault();
            //ECCS IDをおくる
            sessionActions.login({
                ws: this.props.ws,
                eccs: (ReactDOM.findDOMNode(this.refs["eccs"]) as HTMLInputElement).value
            });
        };
    }
}
