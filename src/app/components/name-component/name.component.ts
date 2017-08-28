import {Component, Input} from '@angular/core';
import { Node } from '../../types/node';
import {SocketService} from '../../services/socket.service';

@Component ({
    selector: 'name',
    templateUrl: './name.component.html'
})

/**
 * Name component to change the name of a node. To use on every node's detail view. It contains only one form field :
 * a name input to change the name of the linked node.
 *
 * When the user type a new name in the field, as soon as she hit enter or click outside the field, it post a
 * 'blockNameChanged' on the eventhub. Then the components that use this data will use it to update their view. It also
 * send a 'graph:changenode' message to the server to synchronize it.
 *
 * Created by antoine on 10/07/17.
 */
export class NameComponent {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    @Input() node: Node;
    @Input() eventHub: any;
    timeout: any;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/
    constructor (private socket: SocketService) {
        // Only used to retrieve the socket instance
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                             PUBLIC METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * On change method bind called when the input field triggers an onchange event. It create a timeout that wait 200ms
     * before sending the name update.
     *
     * @param value {string} the new name the user input
     */
    onChange (value: string): void {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.userStoppedEditing(value);
        }, 200);
    }

    /**
     * Send a message on the eventhub for the other components to update their view and send a 'graph:changenode'
     * message to the server to synchronize its data.
     *
     * @param value {string} the new name
     */
    userStoppedEditing (value: string): void {
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
