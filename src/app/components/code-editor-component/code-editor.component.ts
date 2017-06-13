/**
 * Created by antoine on 12/06/17.
 */

import {Component, ViewChild} from '@angular/core';
import {MonacoEditorComponent} from "./ng2-monaco-editor/src/component/monaco-editor.component";

@Component({
    selector: 'code-editor',
    templateUrl: './code-editor.component.html'
})

export class CodeEditorComponent {
    @ViewChild('editor') editor: MonacoEditorComponent;
    code: String = '2+3';
    language: String = 'python';
    eventHub: any;

    constructor () {
        // Do nothing for now
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('resize', () => {
            this.editor.resize();
        });
    }
}
