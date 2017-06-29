/**
 * Created by antoine on 29/06/17.
 */

import {Component} from '@angular/core';
import {DataService} from '../../services/data.service';
import { Node } from '../../types/Node';

@Component ({
    selector: 'data-importer',
    templateUrl: './data-importer.component.html'
})


export class DataImporterComponent {
    // Attributes
    eventHub: any;
    data: Object = {}; // The retrieved and stored data
    linkedNode: Node;

    // Constructor
    constructor (private appData: DataService) {
        // Temporary
        this.data = {
            name: 'antoine',
            age: 21,
            array: [1, 2, 3, 4, 5, 5, 6],
            nestedObject: {
                cat: 'mimi',
                dog: 'jules'
            },
        };
    }

    /* ================================================================================================
                                    UI RELATED METHODS
    ================================================================================================ */

    uploadedFile (e: any) {
        console.log(e);
    }

    /* ================================================================================================
                SET EVENT METHOD COMMON TO ALL COMPONENT USED BY GL-COMPONENT
     ================================================================================================ */

    setEventHub (eventHub: any) {
        this.eventHub = eventHub;

        // Subscribing to events
    }
}
