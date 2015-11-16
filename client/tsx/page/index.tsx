///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import Ws from '../../lib/ws';

import {UserDoc} from '../../../lib/db';

export interface PageProps{
    ws: Ws;
    //entrypage
    eccs?:string;
    //mainpage
    user?:UserDoc;
}
export interface PageState{
}
export class Page extends React.Component<PageProps, PageState>{
}
