/**
 * Created by antoine on 12/06/17.
 */

import { Component } from '@angular/core';
import { Node } from '../../types/node';
import { UUID } from 'angular2-uuid';
import { WorkspaceService } from '../../services/workspace.service';
import * as FBPComponent from '../../types/component';
import { SocketService } from '../../services/socket.service';

@Component({
    selector: 'flow-nodes-list',
    templateUrl: './flow-nodes-list.component.html'
})

export class FlowNodesListComponent {
    // Attributes
    components: Array<Component> = [];
    private eventHub: any; // Golden Layout event hub

    constructor (private workspaceData: WorkspaceService, private socket: SocketService) {
        // Store the components retrieve from the workspaceDataService in an Array because
        // Map is not compatible with ngFor
        const components = this.workspaceData.getComponents();
        components.forEach((component) => {
            this.components.push(component);
        });
    }

    addNode (component: FBPComponent.Component) {
        const node: Node = new Node({
            component: component.name,
            graph: this.workspaceData.flow.graph,
            metadata: {},
            inports: component.inPorts,
            outports: component.outPorts,
            id: UUID.UUID(),
        }, this.workspaceData);
        this.socket.sendAddNode(node);
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('newComponentAvailable', () => {
            const components = this.workspaceData.getComponents();
            components.forEach((component) => {
                if (this.components.indexOf(component) === -1 ) {
                    this.components.push(component);
                }
            });
        });
    }
}
