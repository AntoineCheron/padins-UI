/**
 * Created by antoine on 12/06/17.
 */

import { Component } from '@angular/core';

@Component({
    selector: 'code-editor',
    templateUrl: './code-editor.component.html'
})

export class CodeEditorComponent {
    code: String = '2+3';
    language: String = 'python';
    eventHub: any;

    constructor () {
        // Do nothing for now
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
    }
}
