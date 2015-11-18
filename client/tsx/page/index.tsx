///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import Ws from '../../lib/ws';

import {UserDoc, CallDoc, CallDocWithUser} from '../../../lib/db';

export interface PageProps{
    ws: Ws;
    //entrypage
    eccs?:string;
    //mainpage
    user?:UserDoc;
    call?:CallDoc;
    //rojinpage
    rojin_name?:string;
    sleepings?:Array<CallDocWithUser>;
    preparings?:Array<CallDocWithUser>;
}
export interface PageState{
}
export class Page extends React.Component<PageProps, PageState>{
}
