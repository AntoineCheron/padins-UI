import {Injectable} from '@angular/core';
import {DataService} from '../data.service';
import {FBPMessage} from '../../types/FBPMessage';
/**
 * Created by antoine on 26/06/17.
 */

@Injectable()
export class FileExplorerMessageHandler {
    
    constructor (private appData: DataService) {
        // Nothing for now
    }

    onMessage (ev: MessageEvent) {
        const msg = JSON.parse(ev.data);
        const message: FBPMessage = new FBPMessage(msg['protocol'], msg['command'], msg['payload']);

        switch (message.getCommand()) {
            case 'updatenodes':
                this.appData.updateFileExplorerNodes(message.getPayloadAsJSON());
                break;
            default:
                console.log(`Unknown message on graph : ${message.toJSONstring()}`);
        }
    }
}