///<reference path="../../typings/bundle.d.ts" />
import * as React from 'react';
import Ws from '../lib/ws';

import {default as pageStore, PageStoreData} from '../store/page';
import {default as callStore, CallStoreData} from '../store/call';

import {Page, PageProps, PageState} from './page/index';

import Top from './page/top';
import Entry from './page/entry';
import Main from './page/main';
import Callok from './page/callok';

import RojinTop from './page/rojin-top';
import Rojin from './page/rojin';

export default class App extends React.Component<{
    ws: Ws
},{
    page: PageStoreData,
    call: CallStoreData
}>{
    private page_unsubscribe: ()=>void;
    private call_unsubscribe: ()=>void;
    constructor(){
        super();
        this.state = {
            page: pageStore.getInitialState(),
            call: callStore.getInitialState()
        };
    }
    componentDidMount(){
        this.page_unsubscribe = pageStore.listen((page)=>{
            this.setState({page});
        });
        this.call_unsubscribe = callStore.listen((call)=>{
            this.setState({call});
        });
    }
    componentWillUnmount(){
        this.page_unsubscribe();
        this.call_unsubscribe();
    }
    render(){
        let main:JSX.Element;
        let ws = this.props.ws;
        let {page, call} = this.state;
        switch(page.page){
            case "top":
                main = <Top ws={ws}/>;
                break;
            case "entry":
                main = <Entry ws={ws} eccs={page.eccs}/>;
                break;
            case "main":
                main = <Main ws={ws} user={page.user} call={page.call}/>;
                break;
            case "callok":
                main = <Callok ws={ws}/>;
                break;
            case "rojintop":
                main = <RojinTop ws={ws}/>;
                break;
            case "rojin":
                main = <Rojin ws={ws} rojin_name={page.rojin_name} sleepings={call.sleepings} preparings={call.preparings}/>;
                break;
        }
        return <article className="app">
            <h1>KF66 Morning Call System</h1>
            {main}
        </article>;
    }
}
