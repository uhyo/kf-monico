declare module "csv-parse" {
    function _m(data:string, options:any, callback:(err:Error,data:Array<Array<string>>)=>void):void;
    module _m{
    }
    export = _m;
}
