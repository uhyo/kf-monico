//DBに入るやつ
export interface SessionDoc{
    id:string;
    eccs:string;
    rojin:boolean;
    rojin_name:string;
    rojin_leader:boolean;
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
    //備考ーーーーーーーーーー
    comment:string;
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
    //電話をかけている老人
    occupied_by:string;
    //担当割当老人
    assigned: string;
}

export interface CallDocWithUser extends CallDoc{
    user: UserDoc;
}

export interface SystemInfo{
    date: number;
    roujin_pass: string;
    key: string;
}

export interface CommitteeMember{
    name: string;
    name_phonetic: string;
    azusa: string;
}


export interface RojinMember{
    name: string;
    name_phonetic: string;
    leader: boolean;
}
