import {Injectable} from '@angular/core';
import {WorkspaceService} from '../workspace.service';
import {FBPMessage} from '../../types/FBPMessage';
/**
 * Created by antoine on 26/06/17.
 */

@Injectable()
export class FileExplorerMessageHandler {
    
    constructor (private workspaceData: WorkspaceService) {
        // Nothing for now
    }

    onMessage (ev: MessageEvent) {
        const msg = JSON.parse(ev.data);
        const message: FBPMessage = new FBPMessage(msg['protocol'], msg['command'], msg['payload']);

        switch (message.getCommand()) {
            case 'updatenodes':
                this.workspaceData.updateFileExplorerNodes(message.getPayloadAsJSON());
                break;
            default:
                console.log(`Unknown message on graph : ${message.toJSONstring()}`);
        }
    }
}