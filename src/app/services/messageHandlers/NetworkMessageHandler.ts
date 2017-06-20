/**
 * Created by antoine on 20/06/17.
 */

import {Injectable} from '@angular/core';
import {FBPMessage} from '../../types/FBPMessage';
import {DataService} from '../data.service';

@Injectable()
export class NetworkMessageHandler {

    constructor (private appData: DataService) {
        // Nothing for now
    }

    handleMessage (msg: Object) {
        const message: FBPMessage = new FBPMessage(msg['protocol'], msg['command'], msg['payload']);

        switch (message.getCommand()) {
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
        this.appData.workspace.setNetworkStatus(msg);
    }

    stopped (msg: Object) {
        this.status(msg);
        this.appData.workspace.setNetworkLastStopTime(msg['graph'], msg['time']);
    }

    started (msg: Object) {
        this.status(msg);
        this.appData.workspace.setNetworkLastStartTime(msg['graph'], msg['time']);
    }

    output (msg: Object) {
        console.log(`Output ${msg['type']}, message : ${msg['message']}`);
    }

    error (msg: Object) {
        // Display a bubble to the user
        alert('An error happened, see console logs');

        console.error(`Error ${msg['stack']}, message : ${msg['message']}`);
    }

    persist (msg: Object) {
        alert('Flow saved');
    }

}
