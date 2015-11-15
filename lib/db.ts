//DBに入るやつ
export interface SessionDoc{
    id:string;
    eccs:string;
    rojin:boolean;
    rojin_name:string;
    time:Date;
}

export interface UserDoc{
    eccs:string;
    name:string;
    name_phonetic:string;
    tel:string;
}

