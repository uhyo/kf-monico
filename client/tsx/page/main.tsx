///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page, PageProps, PageState} from './index';

export default class Main extends Page{
    constructor(props){
        super(props);
    }
    render(){
        return <div className="page-main">
            <p>Main page</p>
        </div>;
    }
}


