///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page, PageProps, PageState} from './index';

export default class Top extends Page{
    constructor(props){
        super(props);
    }
    render(){
        return <div>
            <p>This is the top page.</p>
        </div>;
    }
}
