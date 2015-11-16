///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page, PageProps, PageState} from './index';

export default class Main extends Page{
    constructor(props){
        super(props);
    }
    render(){
        return <div className="page-main">
            <div className="main-profile">
                <p><b>{this.props.user.name}</b>さん</p>
                <p><a href="/">ログアウト</a></p>
            </div>
        </div>;
    }
}


