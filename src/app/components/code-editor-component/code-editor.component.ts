/**
 * Created by antoine on 12/06/17.
 */

import {Component, ViewChild} from '@angular/core';
import {MonacoEditorComponent} from './ng2-monaco-editor/src/component/monaco-editor.component';
import {Node} from '../../types/Node';

@Component({
    selector: 'code-editor',
    templateUrl: './code-editor.component.html'
})

export class CodeEditorComponent {
    @ViewChild('editor') editor: MonacoEditorComponent;
    code: string = '2+3';
    language: string = 'python';
    eventHub: any;
    nodeRef: Node;

    constructor () {
        // Do nothing for now
    }

    setNodeRef (node: Node) {
        this.nodeRef = node;
        this.code = node.getCode();
        this.language = node.getLanguage();
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('resize', () => {
            this.editor.resize();
        });
    }
}
