/**
 * Created by antoine on 12/06/17.
 */

import {Component} from '@angular/core';
import {DataService} from '../../services/data.service';
import * as FBPComponent from '../../types/component';

@Component({
    selector: 'flow-nodes-list',
    templateUrl: './flow-nodes-list.component.html'
})

export class FlowNodesListComponent {
    // Attributes
    components: Array<Component> = [];
    private eventHub: any; // Golden Layout event hub

    constructor (private appData: DataService) {
        // Store the components retrieve from the DataService in an Array because
        // Map is not compatible with ngFor
        const components = this.appData.getComponents();
        components.forEach((component) => {
            this.components.push(component);
        });
    }

    addComponentOnGraph (component: FBPComponent.Component) {
        this.eventHub.emit('addNode', component);
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
