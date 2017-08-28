import {Injectable} from '@angular/core';
import {FBPMessage} from '../../types/fbp-message';
import {WorkspaceService} from '../workspace.service';

/**
 * Handle the messages of the network subprotocol from flow-based programming network protocol.
 *
 * Protocol for starting and stopping FBP networks, and finding out about their state.
 *
 * This subprotocol description can be found here :
 * https://flowbased.github.io/fbp-protocol/#network-start
 *
 * Created by antoine on 20/06/17.
 */
@Injectable()
export class NetworkMessageHandler {

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService) {
        // Nothing for now
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PUBLIC METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Redirect the given message to the proper handler method.
     *
     * @param msg {Object} the received network message
     */
    handleMessage (msg: Object) {
        const message: FBPMessage = new FBPMessage(msg['protocol'], msg['command'], msg['payload']);

        switch (message.getCommand()) {
            case 'startnode':
                this.startNode(message.getPayloadAsJSON());
                break;
            case 'finishnode':
                this.finishNode(message.getPayloadAsJSON());
                break;
            case 'status':
                this.status(message.getPayloadAsJSON());
                break;
            case 'stopped':
                this.stopped(message.getPayloadAsJSON());
                break;
            case 'started':
                this.started(message.getPayloadAsJSON());
                break;
            case 'output':
                this.output(message.getPayloadAsJSON());
                break;
            case 'error':
                this.error(message.getPayloadAsJSON());
                break;
            case 'persist':
                this.persist(message.getPayloadAsJSON());
                break;
            default:
                console.log(`Unknown message on network : ${message.toJSONstring()}`);
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PRIVATE METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Store the status of the network.
     *
     * https://flowbased.github.io/fbp-protocol/#network-status
     *
     * @param msg {Object} the 'network:status' message
     */
    private status (msg: Object) {
        this.workspaceData.workspace.setNetworkStatus(msg);
    }

    /**
     * An execution stopped. This method stores the last run's timestamp of the network and broadcast the network's
     * stop event to the rest of the app.
     *
     * https://flowbased.github.io/fbp-protocol/#network-stopped
     *
     * @param msg {Object} the 'network:stopped' message
     */
    private stopped (msg: Object) {
        this.status(msg);
        this.workspaceData.workspace.setNetworkLastStopTime(msg['graph'], msg['time']);
        this.workspaceData.eventHub.emit('simulationfinished');
        alert('Simulation finished');
    }

    /**
     * An execution stopped. This method stores the last start's timestamp of the network and broadcast the network's
     * start event to the rest of the app.
     *
     * https://flowbased.github.io/fbp-protocol/#network-started
     *
     * @param msg {Object} the 'network:started' message
     */
    private started (msg: Object) {
        this.status(msg);
        this.workspaceData.workspace.setNetworkLastStartTime(msg['graph'], msg['time']);
    }

    /**
     * An output message from a running network, roughly similar to STDOUT output of a Unix process, or a line of
     * console.log in JavaScript. Output can also be used for passing images from the runtime to the UI.
     *
     * The message will be logged in the browser's console.
     *
     * https://flowbased.github.io/fbp-protocol/#network-output
     *
     * @param msg {Object} the 'network:output' message
     */
    private output (msg: Object) {
        console.log(`Output ${msg['type']}, message : ${msg['message']}`);
    }

    /**
     * An error from a running network, roughly similar to STDERR output of a Unix process, or a line of console.error
     * in JavaScript.
     *
     * The message will be logged in the browser's console errors.
     *
     * https://flowbased.github.io/fbp-protocol/#network-error
     *
     * @param msg {Object} the 'network:error' message
     */
    private error (msg: Object) {
        // Display an alert to the user
        alert('An error happened, see console errors');

        console.error(`${msg['message']}`);
    }

    /**
     * The full workflow has been saved. Alert the user of this event.
     *
     * https://flowbased.github.io/fbp-protocol/#network-persist
     *
     * @param msg {Object} the 'network:persist' message
     */
    private persist (msg: Object) {
        alert('Flow saved');
    }

    /**
     * A given node has started running. Broadcast this event across the app.
     * This event is mainly used to highlight the running nodes on the workflow.
     *
     * **This is a custom add to the protocol**
     *
     * @param msg {Object} the 'network:startnode' message
     */
    private startNode (msg: object) {
        this.workspaceData.eventHub.emit('flow:startnode', msg['id']);
    }

    /**
     * A given node has stopped running. Broadcast this event across the app.
     * This event is mainly used to remove the highlight of the node to the workflow.
     *
     * **This is a custom add to the protocol**
     *
     * @param msg {Object} the 'network:finishnode' message
     */
    private finishNode (msg: object) {
        this.workspaceData.eventHub.emit('flow:finishnode', msg['id']);
    }

}
