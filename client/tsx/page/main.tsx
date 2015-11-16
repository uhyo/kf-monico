///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page} from './index';

import {CallDoc, CallEntry} from '../../../lib/db';

import CallForm from '../widgets/call-form';

import * as sessionActions from '../../action/session';

export default class Main extends Page{
    constructor(props){
        super(props);
    }
    render(){
        return <section className="page-main">
            <div className="main-profile">
                <p><b>{this.props.user.name}</b>さん</p>
                <p><a href="/">ログアウト</a></p>
            </div>
            <h1>モーニングコール登録</h1>
            <CallForm onSubmit={this.handleSubmit()} call={this.props.call}/>
        </section>;
    }
    private handleSubmit():(call:CallEntry)=>void{
        return (call:CallEntry)=>{
            sessionActions.call({
                ws: this.props.ws,
                call
            });
        };
    }
}


