///<reference path="../typings/bundle.d.ts" />
import * as crypto from 'crypto';
export default function sha256sum(str:string):string{
    let h = crypto.createHash("sha256");
    h.update(str);
    return h.digest("hex");
}
