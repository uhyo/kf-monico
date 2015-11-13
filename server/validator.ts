//バリデータ

export function isECCSID(value:any):boolean{
    if("string"===typeof value){
        return /^\d{10}$/.test(value);
    }else{
        return false;
    }
}
