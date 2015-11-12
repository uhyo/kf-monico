/* polyfill */
declare class WeakMap<T,U>{
    set(key:T, value:U):void;
    get(key:T, value?:U):U;
    has(key:T):boolean;
    delete(key:T):void;
    clear():void;
}
