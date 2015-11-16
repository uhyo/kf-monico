///<reference path="../../typings/bundle.d.ts" />
import * as React from 'react';
import Ws from '../lib/ws';

import {default as pageStore, PageStoreData} from '../store/page';

import {Page, PageProps, PageState} from './page/index';

import Top from './page/top';
import Entry from './page/entry';
import Main from './page/main';

export default class App extends React.Component<{
    ws: Ws
},{
    page: PageStoreData
}>{
    private page_unsubscribe: ()=>void;
    constructor(){
        super();
        this.state = {
            page: pageStore.getInitialState()
        };
    }
    componentDidMount(){
        this.page_unsubscribe = pageStore.listen((page)=>{
            this.setState({page});
        });
    }
    componentWillUnmount(){
        this.page_unsubscribe();
    }
    render(){
        let main:JSX.Element;
        let ws = this.props.ws;
        let page = this.state.page.page;
        switch(page){
            case "top":
                main = <Top ws={ws}/>;
                break;
            case "entry":
                main = <Entry ws={ws} eccs={this.state.page.eccs}/>;
                break;
            case "main":
                main = <Main ws={ws} user={this.state.page.user} call={this.state.page.call}/>;
                break;
        }
        return <article className="app">
            <h1>KF66 Morning Call System</h1>
            {main}
        </article>;
    }
}
