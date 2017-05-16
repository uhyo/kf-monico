import * as Reflux from 'reflux';
import {
    createAction,
} from '../reflux';

export var error = createAction<Error>();

error.listen((err)=>{
    console.error(err);
});

export var clear = createAction<void>();
