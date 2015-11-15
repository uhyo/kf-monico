///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page, PageProps, PageState} from './index';

export default class Entry extends Page{
    constructor(props){
        super(props);
    }
    render(){
        return <div className="page-entry">
            <p>Entry page</p>
        </div>;
    }
}

