///<reference path="../../typings/bundle.d.ts" />
import * as React from 'react';

import {default as pageStore, PageStoreData} from '../store/page';

import {Page, PageProps, PageState} from './page/index';

import Top from './page/top';

export default class App extends React.Component<{},{
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
        let page = this.state.page.page;
        switch(page){
            case "top":
                main = <Top/>;
                break;
        }
        return <div>
            {main}
        </div>;
    }
}
