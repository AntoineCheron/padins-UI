/**
 * Handle the messages of the trace subprotocol from flow-based programming network protocol.
 *
 * This protocol is utilized for triggering and transmitting [Flowtrace](https://github.com/flowbased/flowtrace)s
 *
 * This subprotocol description can be found here :
 * https://flowbased.github.io/fbp-protocol/#trace-start
 *
 * Created by antoine on 03/07/17.
 */

import {Injectable} from '@angular/core';
import {FBPMessage} from '../../types/fbp-message';
import {WorkspaceService} from '../workspace.service';

@Injectable()
export class TraceMessageHandler {


    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor(private workspaceData: WorkspaceService) {
        // Nothing for now
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PUBLIC METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Redirect the given message to the proper handler method.
     *
     * @param msg {Object} the received trace message
     */
    handleMessage (msg: Object) {
        const message: FBPMessage = new FBPMessage(msg['protocol'], msg['command'], msg['payload']);

        switch (message.getCommand()) {
            case 'nodetraceback':
                this.broadcastNodeTraceback(message.getPayloadAsJSON());
                break;
            default:
                console.log(`Unknown message on trace : ${message.toJSONstring()}`);
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PRIVATE METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Handle the 'nodetraceback' message by broadcasting the traceback of a node across the app. The components
     * able to handle it will receive it and do what's needed.
     *
     * **This is a custom add to the protocol**
     *
     * @param msg {Object} the received 'nodetraceback' message
     */
    private broadcastNodeTraceback (msg: Object) {
        this.workspaceData.eventHub.emit('nodetraceback', msg['node'], msg['traceback']);
    }
}
