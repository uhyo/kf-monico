import {Promise} from 'es6-promise';
import * as csvParse from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';

import {CommitteeMember} from '../lib/db';

//委員のデータをよみこむ
export function loadCommitteeMembersData():Promise<Array<CommitteeMember>>{
    return new Promise((fulfill, reject)=>{
        fs.readFile(path.resolve(__dirname, "..", "data", "committee-members.csv"), "utf8", (err,data)=>{
            if(err){
                fulfill([]);
                return;
            }
            csvParse(data, {
                skip_empty_lines: true
            },(err,rows)=>{
                if(err){
                    reject(err);
                    return;
                }
                fulfill(rows.map(([,name,name_phonetic])=>{
                    return {
                        name,
                        name_phonetic
                    };
                }));
            });
        });
    });
}
