///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import Ws from '../../lib/ws';
export interface PageProps{
    ws: Ws;
}
export interface PageState{
}
export class Page extends React.Component<PageProps, PageState>{
}
