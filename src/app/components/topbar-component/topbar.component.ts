/**
 * Topbar of the workspace component. The idea behind this component is to provide the user with features close
 * to a native app toolbar, as can be found in any app with the tabs File Edit View etc.
 *
 * It implements the WorkspaceListener interface in order to update its displayed data when the user connects to
 * another workspace.
 *
 * It displays :
 * - {Project name}
 * - File
 *      - Show graph
 *      - Show components list
 *      - Show file explorer
 * - Save flow
 * - Run Graph
 * - Server connexion : {state}
 * Created by antoine on 19/06/2017.
 */

import { Component } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceListener } from '../../interfaces/workspace-listener';
import { Network, Workspace } from '../../types/workspace';
import { FBPMessage } from '../../types/fbp-message';
import { SocketService } from '../../services/socket.service';
import { FileController } from './file-controller';
import { Router } from '@angular/router';

@Component ({
    selector: 'top-bar',
    templateUrl: './topbar.component.html'
})

export class TopbarComponent implements WorkspaceListener {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    runButtonLabel: string;
    statusIndicatorClass: string;
    runButtonClass: string;
    statusIndicatorIcon: string;

    // Dropdowns controllers
    private fileController: FileController;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService, private socket: SocketService, private router: Router) {
        this.updateWorkspace(workspaceData.workspace);

        workspaceData.subscribeToWorkspaceChanges(this);

        // Initialize dropdowns controllers
        this.fileController = new FileController(workspaceData);
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PUBLIC METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Start the simulation
     */
    runSimulation () {
        const network: Network = this.workspaceData.workspace.mainNetwork;

        if (!network.running) {
            // Send network:start message
            const msg = new FBPMessage('network', 'start', {
                graph: this.workspaceData.flow.graph
            });

            this.socket.ws.send(msg.toJSONstring());

        } else {
            // send network:stop message
            const msg = new FBPMessage('network', 'stop', {
                graph: this.workspaceData.flow.graph
            });

            this.socket.ws.send(msg.toJSONstring());
        }
    }

    /**
     * Update the information displaying the workspace's and network's state, such as the Run/Stop graph button label
     * and color and the server connexion's state
     * @param workspace
     */
    updateWorkspace (workspace: Workspace) {
        const n = workspace.mainNetwork;

        this.runButtonLabel = n.running ? 'Stop' : 'Run Graph';
        this.runButtonClass = n.running ? 'btn-outline-danger' : 'btn-outline-success';

        if (workspace.connected && n.running) {
            this.statusIndicatorClass = 'server-connected';
            this.statusIndicatorIcon = 'fa-circle-o-notch fa-spin';
        } else if (workspace.connected) {
            this.statusIndicatorClass = 'server-connected';
            this.statusIndicatorIcon = 'fa-check';
        } else {
            this.statusIndicatorClass = 'server-disconnected';
            this.statusIndicatorIcon = 'fa-times';
        }
    }

    /**
     * Save the workflow's data. Need to be called in order to save the data of the flow, otherwise when the server
     * restart, all modifications are deleted.
     */
    saveFlow () {
        const msg = new FBPMessage('network', 'persist', '');

        this.socket.ws.send(msg.toJSONstring());
    }

    /**
     * Reconnect the socket to the workspace.
     */
    connectWS () {
        this.socket.reconnectSocket();
    }

    /**
     * Method to call when the user wants to close the workspace. It saves the workflow and close the socket.
     */
    onClose () {
        this.saveFlow();
        this.socket.close();

        this.workspaceData.clear();
    }
}
