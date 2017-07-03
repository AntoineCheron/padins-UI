/**
 * Created by antoine on 03/07/17.
 */

import {Injectable} from '@angular/core';
import {FBPMessage} from '../../types/FBPMessage';
import {DataService} from '../data.service';

@Injectable()
export class TraceMessageHandler {

    constructor(private appData: DataService) {
        // Nothing for now
    }

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

    broadcastNodeTraceback (msg: Object) {
        this.appData.eventHub.emit('nodetraceback', msg['node'], msg['traceback']);
    }
}
