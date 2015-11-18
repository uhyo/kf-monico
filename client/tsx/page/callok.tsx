///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page} from './index';

export default class Callok extends Page{
    constructor(props){
        super(props);
    }
    render(){
        return <div className="page-callok">
            <p>モーニングコールの登録を完了しました。</p>
            <p><a href="/home">戻る</a></p>
        </div>;
    }
}

