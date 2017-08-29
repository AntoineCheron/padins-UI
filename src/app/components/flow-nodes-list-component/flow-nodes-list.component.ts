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

/**
 * This component is used as a sub-component of the workspace component. It is registered in the GoldenLayout component.
 *
 * Display the list of components available to design the workflow. The list of components is retrieved from the
 * WorkspaceService.
 *
 * In terms of UI, the components are displayed in a column. A single click on a component adds it onto the graph.
 *
 * Created by antoine on 12/06/17.
 */
export class FlowNodesListComponent {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    components: Array<Component> = [];
    private eventHub: any; // Golden Layout event hub

    /* -----------------------------------------------------------------------------------------------------------------
                                             CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService, private socket: SocketService) {
        // Store the components retrieve from the workspaceDataService in an Array because
        // Map is not compatible with ngFor
        const components = this.workspaceData.getComponents();
        components.forEach((component) => {
            this.components.push(component);
        });
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PUBLIC METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Add a node built from the given component to the workspace's workflow. In order to achieve this, it creates
     * the new instance of the Node class and send it to the server. The server will send a 'graph:addnode' message
     * in return to confirm the creation. Then the workflow-component will catch the message and dislay the new node.
     *
     * @param component {Component} the component to create a node for
     */
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

    /**
     * Set the eventhub instance to use in order to communicate with the other components, and subscribe to the
     * events useful for this component.
     *
     * It subscribes to :
     * - newComponentAvailable : add a new component in the list
     *
     * @param hub {any} the golden layout event hub to use
     */
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
