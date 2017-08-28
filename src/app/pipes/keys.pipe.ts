/**
 * Pipe that takes a JS object composed of {key: value}s and returns its content in an array containing one object
 * formatted as {key: keyName, value: valueVal} for each key of the original element.
 *
 * Pipes webpage : https://angular.io/guide/pipes
 *
 * Created by antoine on 29/06/17.
 */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {

    /**
     * Takes a JS object composed of {key: value}s and returns its content in an array containing one object
     * formatted as {key: keyName, value: valueVal} for each key of the original element.
     *
     * @param value {object} the object to transform
     * @param args Optional other params. Unused.
     * @returns {Array} containing all the initial object's key value pairs formatted as {key: keyName, value: valueVal}
     */
    transform(value: object, args: string[]): Array<object> {
        let keys = [];
        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                keys.push({key: key, value: JSON.stringify(value[key])});
            }
        }
        return keys;
    }
}
