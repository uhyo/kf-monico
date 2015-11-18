///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import {Page} from './index';

import RojinPass from '../widgets/rojin-pass';

export default class RojinTop extends Page{
    constructor(props){
        super(props);
    }
    render(){
        return <div className="page-rojin-top">
            <div className="top-form">
                <RojinPass onSubmit={this.handleSubmit()}/>
            </div>
            <div className="top-link">
                <p><a href="/">もどる</a></p>
            </div>
        </div>;
    }
    private handleSubmit(){
        return ({name,pass})=>{
            localStorage.setItem("monico_rojin_name", name);
            this.props.ws.send({
                command:"rojin-login",
                name,
                pass
            });
        };
    }
}
