///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import Ws from '../../lib/ws';

import {UserDoc, CallDoc, CallDocWithUser, CommitteeMember} from '../../../lib/db';

export interface PageProps{
    ws: Ws;
    //entrypage
    system?:boolean;
    eccs?:string;
    //mainpage
    user?:UserDoc;
    call?:CallDoc;
    //rojinpage
    date?: number;
    rojin_name?:string;
    calls?:Array<CallDocWithUser>;
    nocalls?:Array<CommitteeMember>;
}
export interface PageState{
    //rojinpage
    sleeping_sort_mode: string;
    preparing_sort_mode: string;
}
export class Page extends React.Component<PageProps, PageState>{
}
