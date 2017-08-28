import {Injectable} from '@angular/core';
import {WorkspaceService} from '../workspace.service';
import {FBPMessage} from '../../types/fbp-message';

/**
 * Handle the messages from the fileexplorer subprotocol. It is a not a FBP Network Protocol but a protocol built
 * for this program. To keep consistency into the program, this subprotocol uses the FBP Messages's format, as described
 * in /src/types/fbp-message.ts.
 *
 * This subprotocol is used to received workspace's root folder's content updates.
 *
 * Created by antoine on 26/06/17.
 */
@Injectable()
export class FileExplorerMessageHandler {

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
     * @param msg {Object} the received fileexplorer message
     */
    handleMessage (ev: MessageEvent) {
        const msg = JSON.parse(ev.data);
        const message: FBPMessage = new FBPMessage(msg['protocol'], msg['command'], msg['payload']);

        switch (message.getCommand()) {
            case 'updatenodes':
                this.updateNodes(message.getPayloadAsJSON());
                break;
            default:
                console.log(`Unknown message on graph : ${message.toJSONstring()}`);
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PRIVATE METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Update the tree explorer nodes content
     *
     * @param msg {Object} the 'fileexplorer:updatenodes' message
     */
    private updateNodes (msg: Object) {
        this.workspaceData.updateFileExplorerNodes(msg);
    }
}
