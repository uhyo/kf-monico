declare module "reflux"{
    export interface Store<T>{
        init():void;
        getInitialState():T;
        listen(callback:(state:T)=>void):()=>void;
    }
    export function createStore<T>(opts:{
        init:Function;
        getInitialState:()=>T,
        [field:string]:any;
    }):Store<T>;
}
