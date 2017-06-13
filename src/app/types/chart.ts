/**
 * Created by antoine on 13/06/17.
 */

import { UUID } from 'angular2-uuid';

export class Chart {
    id: String;
    type: String;
    selectedResults: Array<String>;
    abscissa: String;
    abscissaValue: Array<String>;
    selectedResultsValues: Array<Array<any>>;

    constructor () {
        this.id = UUID.UUID();
        this.type = 'default';
        this.selectedResults = [];
        this.abscissa = '';
        this.abscissaValue = [];
        this.selectedResultsValues = [];
    }
}
