/**
 * Created by antoine on 19/06/2017.
 */

import { Component } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceListener } from '../../Interfaces/WorkspaceListener';
import { Network, Workspace } from '../../types/Workspace';
import { FBPMessage } from '../../types/FBPMessage';
import { SocketService } from '../../services/socket.service';
import { FileController } from './FileController';
import { Router } from '@angular/router';

@Component ({
    selector: 'top-bar',
    templateUrl: './topbar.component.html'
})

export class TopbarComponent implements WorkspaceListener {
    runButtonLabel: string;
    statusIndicatorClass: string;
    runButtonClass: string;
    statusIndicatorIcon: string;

    // Dropdowns controllers
    private fileController: FileController;

    constructor (private workspaceData: WorkspaceService, private socket: SocketService, private router: Router) {
        this.updateWorkspace(workspaceData.workspace);

        workspaceData.subscribeToWorkspaceChanges(this);

        // Initialize dropdowns controllers
        this.fileController = new FileController(workspaceData);
    }

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

    saveFlow () {
        const msg = new FBPMessage('network', 'persist', '');

        this.socket.ws.send(msg.toJSONstring());
    }

    connectWS () {
        this.socket.reconnectSocket();
    }

    onClose () {
        this.saveFlow();
        this.socket.close();

        this.workspaceData.clear();
    }
}
