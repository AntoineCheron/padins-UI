/**
 * Created by antoine on 29/06/17.
 */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
    transform(value, args: string[]): any {
        let keys = [];
        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                keys.push({key: key, value: JSON.stringify(value[key])});
            }
        }
        return keys;
    }
}
