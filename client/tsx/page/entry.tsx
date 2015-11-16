///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page} from './index';

import UserForm from '../widgets/user-form';

import {UserDoc} from '../../../lib/db';

export default class Entry extends Page{
    constructor(props){
        super(props);
    }
    render(){
        let user:UserDoc = this.props.user || {
            eccs: this.props.eccs,
            name: null,
            name_phonetic: null,
            tel: null
        };
        return <section className="page-entry">
            <h1>ユーザー登録</h1>
            <p>ユーザー情報を入力してください。</p>
            <UserForm user={user} onSubmit={this.handleSubmit()}/>
        </section>;
    }
    private handleSubmit():(user:UserDoc)=>void{
        return (user:UserDoc)=>{
            console.log(user);
        };
    }
}

