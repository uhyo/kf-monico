///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page} from './index';

import RojinPass from '../widgets/rojin-pass';

//老人メインインターフェース
export default class Rojin extends Page{
    constructor(props){
        super(props);
    }
    render(){
        return <section className="page-rojin">
            <h1>老人ホーム</h1>
            <p>老人ページです。</p>
        </section>;
    }
}

