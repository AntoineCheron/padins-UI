/**
 * Created by antoine on 17/07/17.
 */

import {Pipe, PipeTransform} from '@angular/core';
import * as Convert from 'ansi-to-html';

@Pipe({name: 'tracebackHtml'})
export class TracebackHtmlPipe implements PipeTransform {
    convert: Convert;

    constructor () {
        this.convert = new Convert();
    }
    transform(value: string[]): string {
        let res = '';

        if (value) {
            let trace = [];
            value.forEach((traceEl: string) => {
                const temp = traceEl.split('\n');
                temp.forEach((t: string) => {
                    trace.push(t);
                });
            });

            trace.forEach((t: string) => {
                res += this.convert.toHtml(t.replace(/</g, ' ').replace(/>/g, ' ')) + '<br/>';
            });
        }

        return res;
    }
}
