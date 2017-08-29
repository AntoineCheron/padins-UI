import {Component, ViewChild} from '@angular/core';
import {MonacoEditorComponent} from './ng2-monaco-editor/src/component/monaco-editor.component';
import {Node} from '../../types/node';
import {SocketService} from '../../services/socket.service';
import * as Convert from 'ansi-to-html';

@Component({
    selector: 'code-editor',
    templateUrl: './code-editor.component.html'
})

/**
 * This component is used as a sub-component of the workspace component. It is registered in the GoldenLayout component.
 * It is the detailed view of a 'processing' or 'simulation' node.
 *
 * This component includes a [Monaco code editor](https://microsoft.github.io/monaco-editor/) and a section to display
 * the traceback that the Jupyter Kernel returns if an error occurs during the execution of the linked node.
 *
 * As any node's detailed view components it also contains the name-component to let the user change the name of the
 * linked node.
 *
 * Created by antoine on 12/06/17.
 */
export class CodeEditorComponent {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    @ViewChild('editor') editor: MonacoEditorComponent;
    language: string;
    eventHub: any;
    nodeRef: Node;
    timeout: any;
    traceback: string = '';
    convert: Convert;

    // UI properties
    modificationSaved: boolean = true;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private socket: SocketService) {
        this.convert = new Convert();
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                PUBLIC METHODS CALLED BY USER ACTIONS ON THE VIEW
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Set the node this component's instance is linked to.
     *
     * @param node {Node} this component's linked node
     */
    setNodeRef (node: Node) {
        this.nodeRef = node;
        this.language = node.getLanguage();
    }

    /**
     * Method triggered when the code change. It changes the modificationSaved state to false and automatically
     * save the modification after the user stopped writing for 1 second.
     */
    codeChanged (): void {
        // Reinitialize the timeout used to send a changenode event each time the user stop editing the code
        this.reinitTimeout();
        this.modificationSaved = false;
    }

    /**
     * Method to call after the user stopped editing. We consider it to be 1 second after the code stopped changing.
     * It sends the modification of the code to the server.
     */
    userStoppedEditing () {
        // Send the nodechange message to server
        this.socket.sendChangeNode(this.nodeRef);
        this.modificationSaved = true;
    }

    /**
     * Reinitialize the timeout that automatically save the modification after the user stopped writing for 1 second.
     */
    reinitTimeout () {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.userStoppedEditing();
        }, 1000);
    }

    /* -----------------------------------------------------------------------------------------------------------------
                SET EVENT METHOD & SET NODE REF COMMON TO ALL COMPONENT USED BY GL-COMPONENT
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Set the eventhub instance to use in order to communicate with the other components, and subscribe to the
     * events useful for this component.
     *
     * Subscribes to :
     * - resize : trigger the resize method of the code editor on component's window resize
     * - nodetraceback : update the content of the traceback
     *
     * @param hub {any} the golden layout event hub to use
     */
    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('resize', () => {
            this.editor.resize();
        });

        this.eventHub.on('nodetraceback', (nodeId: String, traceback: string[]) => {
            this.traceback = '';

            if (this.nodeRef.id === nodeId) {
                this.nodeRef.setTraceback(traceback);
            }
        });
    }
}
