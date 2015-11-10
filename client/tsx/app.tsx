///<reference path="../../typings/bundle.d.ts" />
import * as React from 'react';

import {default as pageStore, PageStoreData} from '../store/page';

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
        return <div>
            <p>Hello, world!</p>
            <p>page: {this.state.page.page}</p>
        </div>;
    }
}
