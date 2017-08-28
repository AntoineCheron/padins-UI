import { UUID } from 'angular2-uuid';

/**
 * A Chart class used to manipulate chart's data across the app.
 *
 * Created by antoine on 13/06/17.
 */
export class Chart {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    public id: string;
    public type: string;
    public selectedResults: Array<string>;
    public abscissa: string;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor () {
        this.id = UUID.UUID();
        this.type = 'default';
        this.selectedResults = [];
        this.abscissa = '';
    }
}
