/**
 * Created by antoine on 10/07/17.
 */

import {Component, Input} from '@angular/core';
import { Node } from '../../types/Node';
import {SocketService} from '../../services/socket.service';

@Component ({
    selector: 'name',
    templateUrl: './name.component.html'
})

export class NameComponent {
    @Input() node: Node;
    @Input() eventHub: any;
    timeout: any;

    constructor (private socket: SocketService) {

    }

    onChange (value: string) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.userStoppedEditing(value);
        }, 200);
    }

    userStoppedEditing (value) {
        // Update the name of the node
        this.node.setName(value);

        // Prevent other components that the name of the block has changed
        if (this.eventHub) {
            this.eventHub.emit('blockNameChanged', this.node);
        }

        // Send a message to the server to let it know that the name changed
        this.socket.sendChangeNode(this.node);
    }

}
