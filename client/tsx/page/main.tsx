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
            <header>
                <p><b>{this.props.user.name}</b>さん</p>
                <p><a href="/">ログアウト</a></p>
                <p><a href="/entry">プロフィール修正</a></p>
                <h1>モーニングコール登録</h1>
            </header>
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


