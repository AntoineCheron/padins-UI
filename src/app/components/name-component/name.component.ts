/**
 * Created by antoine on 10/07/17.
 */

import {Component, Input} from '@angular/core';
import { Node } from '../../types/Node';

@Component ({
    selector: 'name',
    templateUrl: './name.component.html'
})

export class NameComponent {
    @Input() node: Node;
    @Input() eventHub: any;
    timeout: any;

    constructor () {

    }

    onChange (value: string) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.userStoppedEditing(value);
        }, 200);
    }

    userStoppedEditing (value) {
        this.node.setName(value);

        // Update the name of the window opened for this node
        if (this.eventHub) {
            this.eventHub.emit('blockNameChanged', this.node);
        }

    }

}
