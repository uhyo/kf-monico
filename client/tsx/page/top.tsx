///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page, PageProps, PageState} from './index';

import EccsForm from '../widgets/eccs-form';

export default class Top extends Page{
    constructor(props){
        super(props);
    }
    render(){
        return <div className="page-top">
            <h1>KF66 Morning Call System</h1>
            <div className="top-form">
                <EccsForm ws={this.props.ws}/>
            </div>
            <div className="top-link">
                <p><a href="/rojin">老人ログイン</a></p>
            </div>
        </div>;
    }
}
