/**
 * Created by antoine on 13/06/17.
 */

import { UUID } from 'angular2-uuid';

export class Chart {
    id: string;
    type: string;
    selectedResults: Array<string>;
    abscissa: string;

    constructor () {
        this.id = UUID.UUID();
        this.type = 'default';
        this.selectedResults = [];
        this.abscissa = '';
    }
}
