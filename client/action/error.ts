import * as Reflux from 'reflux';

export var error = Reflux.createAction<Error>();

error.listen((err)=>{
    console.error(err);
});

export var clear = Reflux.createAction<void>();
