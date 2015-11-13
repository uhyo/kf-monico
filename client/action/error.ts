///<reference path="../../typings/reflux.d.ts" />
import * as Reflux from 'reflux';

export var error = Reflux.createAction<Error>();

error.listen((err)=>{
    console.error(err);
});
