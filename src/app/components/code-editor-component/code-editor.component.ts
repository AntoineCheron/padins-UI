/**
 * Created by antoine on 12/06/17.
 */

import {Component, ViewChild} from '@angular/core';
import {MonacoEditorComponent} from './ng2-monaco-editor/src/component/monaco-editor.component';
import {Node} from '../../types/Node';
import {SocketService} from '../../services/socket.service';

@Component({
    selector: 'code-editor',
    templateUrl: './code-editor.component.html'
})

export class CodeEditorComponent {
    @ViewChild('editor') editor: MonacoEditorComponent;
    language: string = 'python';
    eventHub: any;
    nodeRef: Node;
    timeout: any;

    constructor (private socket: SocketService) {
        // Do nothing for now
    }

    setNodeRef (node: Node) {
        this.nodeRef = node;
        // this.language = node.getLanguage();
    }

    codeChanged (value: any) {
        if (event.type === 'input') {
            // Set the code
            this.nodeRef.metadata['code'] = value;

            // Reinitialize the timeout used to send a changenode event each time the user stop editing the code
            this.reinitTimeout();
        }
    }

    userStoppedEditing () {
        // Send the nodechange message to server
        this.socket.sendNodeChange(this.nodeRef);
    }

    reinitTimeout () {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.userStoppedEditing();
        }, 3000);
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('resize', () => {
            this.editor.resize();
        });
    }
}
