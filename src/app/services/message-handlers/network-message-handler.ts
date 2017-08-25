/**
 * Created by antoine on 20/06/17.
 */

import {Injectable} from '@angular/core';
import {FBPMessage} from '../../types/fbp-message';
import {WorkspaceService} from '../workspace.service';

@Injectable()
export class NetworkMessageHandler {

    constructor (private workspaceData: WorkspaceService) {
        // Nothing for now
    }

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

    status (msg: Object) {
        this.workspaceData.workspace.setNetworkStatus(msg);
    }

    stopped (msg: Object) {
        this.status(msg);
        this.workspaceData.workspace.setNetworkLastStopTime(msg['graph'], msg['time']);
        this.workspaceData.eventHub.emit('simulationfinished');
        alert('Simulation finished');
    }

    started (msg: Object) {
        this.status(msg);
        this.workspaceData.workspace.setNetworkLastStartTime(msg['graph'], msg['time']);
    }

    output (msg: Object) {
        console.log(`Output ${msg['type']}, message : ${msg['message']}`);
    }

    error (msg: Object) {
        // Display a bubble to the user
        alert('An error happened, see console logs');

        console.error(`${msg['message']}`);
    }

    persist (msg: Object) {
        alert('Flow saved');
    }

    startNode (msg: object) {
        this.workspaceData.eventHub.emit('flow:startnode', msg['id']);
    }

    finishNode (msg: object) {
        this.workspaceData.eventHub.emit('flow:finishnode', msg['id']);
    }

}
