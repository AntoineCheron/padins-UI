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

    uploadedFile (e: Event) {
        const files: FileList = e.target['files'];
        console.log(files);

        for (let i = 0; i < files.length; i++) {
            const f: File = files[i];

            switch (f.type) {
                case 'text/plain':
                    this.handleTextPlainFile(f);
                    break;
                case '' :
                    if (f.name.substring(f.name.lastIndexOf('.')) === 'input') {
                        this.handleInputFile(f);
                    } else {
                        this.handleUnknownFile(f);
                    }
                    break;
                case 'application/json':
                    this.handleJsonFile(f);
                    break;
                case 'application/vnd.oasis.opendocument.spreadsheet':
                    this.handleODSFile(f);
                    break;
                case 'application/vnd.ms-excel':
                    this.handleExcelFile(f);
                    break;
                default:
                    break;
            }
        }
    }

    /* ================================================================================================
                                                PARSERS
     ================================================================================================ */

    handleTextPlainFile (f: File) {
        // Try to parse as if it was a Javascript file
    }

    handleUnknownFile (f: File) {

    }

    handleJsonFile (f: File) {
        const reader = new FileReader();
        const res = {};
        Object.assign(res, this.data);

        reader.onload = (e) => {
            // Retrieve the text
            const r = reader.result;
            // Parse it
            const result = JSON.parse(r);
            // Add everything into the this.data object
            for (let key in result) {
               if (result.hasOwnProperty(key)) {
                   res[key] = result[key];
               }
            }

            this.data = res;
        };

        reader.readAsText(f);
    }

    handleODSFile (f: File) {

    }

    handleInputFile (f: File) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Retrieve the text
            const r = reader.result;
            console.log(r);
            // Parse it
        };

        reader.readAsText(f);
    }

    handleExcelFile (f: File) {

    }

    /* ================================================================================================
                SET EVENT METHOD COMMON TO ALL COMPONENT USED BY GL-COMPONENT
     ================================================================================================ */

    setEventHub (eventHub: Event) {
        this.eventHub = eventHub;

        // Subscribing to events
    }
}
