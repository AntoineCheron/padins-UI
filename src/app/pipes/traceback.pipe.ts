/**
 * Created by antoine on 17/07/17.
 */

import { Pipe, PipeTransform } from '@angular/core';
import * as Convert from 'ansi-to-html';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Pipe({name: 'tracebackHtml'})
export class TracebackHtmlPipe implements PipeTransform {
    convert: Convert;

    constructor (private sanitizer: DomSanitizer) {
        this.convert = new Convert({
            colors: {
                0: '#000',
                1: '#C55454',
                2: '#66CC66',
                3: '#CD9C6B',
                4: '#50C2F6',
                5: '#B92EB9',
                6: '#0AA',
                7: '#A0A0A0',
                8: '#737373',
                9: '#F55',
                10: '#5F5',
                11: '#FF5',
                12: '#55F',
                13: '#F5F',
                14: '#5FF',
                15: '#FFF',
            }
        });
    }

    transform(value: string[]): SafeHtml {
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

        return this.sanitizer.bypassSecurityTrustHtml(res);
    }
}
