/**
 * Created by antoine on 12/06/17.
 */

import {Component, ViewChild} from '@angular/core';
import {MonacoEditorComponent} from './ng2-monaco-editor/src/component/monaco-editor.component';
import {Node} from '../../types/Node';
import {SocketService} from '../../services/socket.service';
import * as Convert from 'ansi-to-html';

@Component({
    selector: 'code-editor',
    templateUrl: './code-editor.component.html'
})

export class CodeEditorComponent {
    @ViewChild('editor') editor: MonacoEditorComponent;
    language: string;
    eventHub: any;
    nodeRef: Node;
    timeout: any;
    traceback: string = '';
    convert: Convert;

    constructor (private socket: SocketService) {
        this.convert = new Convert();
    }

    setNodeRef (node: Node) {
        this.nodeRef = node;
        this.language = node.getLanguage();
    }

    codeChanged (value: any) {
        if (event.type === 'input') {
            // Reinitialize the timeout used to send a changenode event each time the user stop editing the code
            this.reinitTimeout();
        }
    }

    userStoppedEditing () {
        // Send the nodechange message to server
        this.socket.sendChangeNode(this.nodeRef);
    }

    reinitTimeout () {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.userStoppedEditing();
        }, 1000);
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('resize', () => {
            this.editor.resize();
        });

        this.eventHub.on('nodetraceback', (nodeId: String, traceback: string[]) => {
            this.traceback = '';

            if (this.nodeRef.id === nodeId) {
                for (let i = 0; i < traceback.length; i++) {
                    this.traceback += this.convert.toHtml(traceback[i]) + '<br/>';
                }
            }
        });
    }
}
