///<reference path="../../../typings/bundle.d.ts" />
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Ws from '../../lib/ws';

export interface IPropRojinPass{
    rojins: Array<{
        name: string;
        name_phonetic: string;
    }>;
    onSubmit(obj:{
        name:string;
        pass:string;
    }): void;
}
export interface IStateRojinPass{
    sonota_open: boolean;
}
export default class RojinPass extends React.Component<IPropRojinPass, IStateRojinPass>{
    constructor(props: IPropRojinPass){
        super(props);
        this.state = {
            sonota_open: false,
        };
    }
    render(){
        const namechange = ()=>{
            const select = this.refs.name as HTMLSelectElement;
            const value = select.value;
            this.setState({
                sonota_open: value === 'その他',
            });
        };
        const nameselect = <select ref="name" defaultValue={localStorage.getItem('monico_rojin_name')} onChange={namechange}>
            {
                this.props.rojins.map(({name})=>{
                    return <option key={name} value={name}>{name}</option>;
                })
            }
            <option value="その他">その他</option>
        </select>;
        let nameinput = null;
        if (this.state.sonota_open){
            nameinput = <p>
                <input ref="name_sonota" type="text" required placeholder="てらだ" />
            </p>;
        }
        return <form onSubmit={this.submitHandler()}>
            <p>おなまえ</p>
            {nameselect}
            {nameinput}
            <p>老人パスワードを入力してください：</p>
            <p><input ref="pass" type="password" required/></p>
            <p><input type="submit" value="老人ログイン" /></p>
        </form>;
    }
    private getName(){
        if (this.state.sonota_open){
            return (this.refs.name_sonota as HTMLInputElement).value;
        }else{
            return (this.refs.name as HTMLSelectElement).value;
        }
    }
    private submitHandler(){
        return (e)=>{
            e.preventDefault();
            const name = this.getName();

            const pass = ((this.refs.pass as HTMLInputElement).value);
            this.props.onSubmit({
                name,
                pass,
            });
        };
    }
}

