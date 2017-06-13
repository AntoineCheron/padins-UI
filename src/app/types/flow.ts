/**
 * Created by antoine on 12/06/17.
 */

import { UUID } from 'angular2-uuid';

export class Flow {
    public graph: String;

    constructor () {
        this.graph = UUID.UUID();
    }
}
