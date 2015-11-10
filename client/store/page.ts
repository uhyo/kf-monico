///<reference path="../../typings/reflux.d.ts" />

import * as Reflux from 'reflux';

export interface PageStoreData{
    page: string;
}

let pageStore = Reflux.createStore({
    getInitialState():PageStoreData{
        return {
            page: "top"
        };
    },
    init():void{

    }
});

export default pageStore;
