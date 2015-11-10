///<reference path="../typings/bundle.d.ts" />
import config=require('config');
import mongodb=require('mongodb');

import {Promise} from 'es6-promise';

export default class Db{
    private db:mongodb.Db;
    constructor(){
    }
    init():Promise<Db>{
        return Promise.resolve(this);
    }
}
