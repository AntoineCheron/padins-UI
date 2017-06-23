/**
 * Created by antoine on 19/06/2017.
 */

import {Component} from '@angular/core';
import {DataService} from '../../services/data.service';
import {WorkspaceListener} from '../../Interfaces/WorkspaceListener';
import {Network, Workspace} from '../../types/Workspace';
import {FBPMessage} from '../../types/FBPMessage';
import {SocketService} from '../../services/socket.service';

@Component ({
    selector: 'top-bar',
    templateUrl: './topbar.component.html'
})

export class TopbarComponent implements WorkspaceListener {
    runButtonLabel: string;
    statusIndicatorClass: string;
    runButtonClass: string;
    statusIndicatorLabel: string;

    constructor (private appData: DataService, private socket: SocketService) {
        this.updateWorkspace(appData.workspace);

        appData.subscribeToWorkspaceChanges(this);
    }

    runSimulation () {
        const network: Network = this.appData.workspace.mainNetwork;

        if (!network.running) {
            // Send network:start message
            const msg = new FBPMessage('network', 'start', {
                graph: this.appData.flow.graph
            });

            this.socket.ws.send(msg.toJSONstring());

        } else {
            // send network:stop message
            const msg = new FBPMessage('network', 'stop', {
                graph: this.appData.flow.graph
            });

            this.socket.ws.send(msg.toJSONstring());
        }
    }

    updateWorkspace (workspace: Workspace) {
        const n = workspace.mainNetwork;

        this.runButtonLabel = n.running ? 'Stop' : 'Run';
        this.runButtonClass = n.running ? 'btn-outline-danger' : 'btn-outline-success';

        if (workspace.connected && n.running) {
            this.statusIndicatorClass = 'badge-success';
            this.statusIndicatorLabel = 'Running';
        } else if (workspace.connected) {
            this.statusIndicatorClass = 'badge-info';
            this.statusIndicatorLabel = 'Connected';
        } else {
            this.statusIndicatorClass = 'badge-danger';
            this.statusIndicatorLabel = 'Disconnected';
        }
    }

    saveFlow () {
        const msg = new FBPMessage('network', 'persist', '');

        this.socket.ws.send(msg.toJSONstring());
    }

    connectWS () {
        this.socket.reconnectSocket();
    }
}
