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
    //本部到着までの時間の記録（分）
    record:number;
}

//委員が入力する情報
export interface CallEntry{
    hour:number;
    minute:number;
}

export interface CallDoc extends CallEntry{
    eccs:string;
    date:number;
    //スヌーズ情報
    next_hour:number;
    next_minute:number;
    snooze:number;
    //起床したか
    awake:boolean;
    //本部到着したか
    confirmed:boolean;
    //かけているか
    occupied:boolean;
    //担当老人
    occupied_by:string;
}

export interface CallDocWithUser extends CallDoc{
    user: UserDoc;
}

export interface SystemInfo{
    date: number;
    roujin_pass: string;
    key: string;
}
