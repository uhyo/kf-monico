import * as React from 'react';
import Ws from '../lib/ws';

import {default as pageStore, PageStoreData} from '../store/page';
import {default as callStore, CallStoreData} from '../store/call';

import {Page, PageProps, PageState} from './page/index';

import * as errorActions from '../action/error';

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
    call: CallStoreData,
}>{
    private page_unsubscribe: ()=>void;
    private call_unsubscribe: ()=>void;
    constructor(){
        super();
        this.state = {
            page: pageStore.getInitialState(),
            call: callStore.getInitialState(),
        };
    }
    componentDidMount(){
        this.page_unsubscribe = pageStore.listen((page)=>{
            (this as any).setState({page});
        });
        this.call_unsubscribe = callStore.listen((call)=>{
            (this as any).setState({call});
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
                main = <Entry ws={ws} eccs={page.eccs} system={page.system} user={page.user}/>;
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
                main = <Rojin ws={ws} rojin_name={page.rojin_name} date={call.date} calls={call.calls} nocalls={page.nocalls}/>;
                break;
        }
        //ローディング画面
        let basepath = document.body.getAttribute("data-basepath");
        let loading = null;
        if(page.loading_content===true){
            let cls = "app-loading";
            if(page.loading===false){
                cls += " app-loading-hidden";
            }
            let obj = page.loading_type===0 ?
                basepath+"static/komakkero-loading.svg" :
                basepath+"static/komakkero-loading2.svg";
            loading = <div className={cls}>
                <div className="app-loading-info">
                    <p>Loading...</p>
                </div>
                <div className="app-loading-image">
                    <div className="app-loading-image-wrapper">
                        <object data={obj} type="image/svg+xml" />
                    </div>
                </div>
            </div>;
        }else{
            loading = <div className="app-loading app-loading-hidden"/>;
        }
        //エラー画面
        let error_cls = "app-error";
        if(page.error===false){
            error_cls+=" app-error-hidden";
        }
        let error = <div className={error_cls}>
            <div className="app-error-image">
                <object data={basepath+"static/komakkero-error.svg"} type="image/svg+xml"/>
            </div>
            <div className="app-error-info-wrapper">
                <section className="app-error-info">
                    <h1>エラー</h1>
                    <p>{page.error_message}</p>
                    <p>
                        <input type="button" value="OK" onClick={this.errorOkHandler()} />
                    </p>
                </section>
            </div>
        </div>;
        return <article className="app">
            <h1 className="app-header">KF66 Morning Call System</h1>
            <div className="app-main">
                {main}
            </div>
            {loading}
            {error}
        </article>;
    }
    private errorOkHandler(){
        return (e)=>{
            errorActions.clear(null);
        };
    }
}
