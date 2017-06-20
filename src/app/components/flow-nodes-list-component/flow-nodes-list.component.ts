/**
 * Created by antoine on 12/06/17.
 */

import {Component} from '@angular/core';
import {Node} from '../../types/Node';
import { UUID } from 'angular2-uuid';
import {DataService} from '../../services/data.service';
import * as FBPComponent from '../../types/Component';
import {SocketService} from '../../services/socket.service';

@Component({
    selector: 'flow-nodes-list',
    templateUrl: './flow-nodes-list.component.html'
})

export class FlowNodesListComponent {
    // Attributes
    components: Array<Component> = [];
    private eventHub: any; // Golden Layout event hub

    constructor (private appData: DataService, private socket: SocketService) {
        // Store the components retrieve from the DataService in an Array because
        // Map is not compatible with ngFor
        const components = this.appData.getComponents();
        components.forEach((component) => {
            this.components.push(component);
        });
    }

    addNode (component: FBPComponent.Component) {
        const node: Node = new Node({
            component: component.name,
            graph: this.appData.flow.graph,
            metadata: {},
            inPorts: component.inPorts,
            outPorts: component.outPorts,
            id: UUID.UUID(),
        }, this.appData);
        this.socket.sendAddNode(node);
    }

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('newComponentAvailable', () => {
            const components = this.appData.getComponents();
            components.forEach((component) => {
                if (this.components.indexOf(component) === -1 ) {
                    this.components.push(component);
                }
            });
        });
    }
}
