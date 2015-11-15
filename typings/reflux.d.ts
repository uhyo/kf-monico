declare module "reflux"{
    export interface ActionMethods{
    }
    export interface Action<T> extends ActionMethods{
        (value:T):void;

        preEmit():void;
        shouldEmit(value:T):boolean;
        listen(callback:(value:T)=>void):void;
    }
    export interface Store<T>{
        init():void;
        getInitialState():T;
        listen(callback:(state:T)=>void):()=>void;
        listenTo<U>(action:Action<U>, callback:(data:U)=>void):void;
        listenToMany(actions:any):void;
        trigger(obj:T):void;
    }
    export function createAction<T>():Action<T>;
    export function createStore<T>(opts:{
        init:Function;
        getInitialState:()=>T,
        [field:string]:any;
    }):Store<T>;
}
