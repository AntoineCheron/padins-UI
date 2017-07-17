import {Injectable} from '@angular/core';
import {FBPMessage} from '../../types/FBPMessage';
import {Node} from '../../types/Node';
import {Edge} from '../../types/Edge';
import {WorkspaceService} from '../workspace.service';
/**
 * Created by antoine on 15/06/2017.
 */

@Injectable()
export class GraphMessageHandler {

    constructor (private workspaceData: WorkspaceService) {
        // Nothing for now
    }

    handleMessage (msg: Object) {
        const message: FBPMessage = new FBPMessage(msg['protocol'], msg['command'], msg['payload']);

        switch (message.getCommand()) {
            case 'addnode':
                this.addNode(message.getPayloadAsJSON());
                break;
            case 'addedge':
                this.addEdge(message.getPayloadAsJSON());
                break;
            case 'removeedge':
                this.removeEdge(message.getPayloadAsJSON());
                break;
            case 'changeedge':
                this.changeEdge(message.getPayloadAsJSON());
                break;
            case 'removenode':
                this.removeNode(message.getPayloadAsJSON());
                break;
            case 'changenode':
                this.changeNode(message.getPayloadAsJSON());
                break;
            default:
                console.log(`Unknown message on graph : ${message.toJSONstring()}`);
        }
    }

    addNode (msg: Object) {
        const n: Node = new Node(msg, this.workspaceData);
        this.workspaceData.addNode(n);
    }

    removeNode (msg: Object) {
        const n: Node = this.workspaceData.getNode(msg['id']);

        this.workspaceData.removeNode(n);
    }

    changeNode (msg: Object) {
        const n: Node = this.workspaceData.getNode(msg['id']);

        n.setMetadata(msg['metadata']);
    }

    addEdge (msg: Object) {
        const e: Edge = new Edge(msg);

        this.workspaceData.addEdge(e);
    }

    removeEdge (msg: Object) {
        const e: Edge = this.workspaceData.getEdge(msg['id']);

        this.workspaceData.removeEdge(e);
    }

    changeEdge (msg: Object) {
        const e: Edge = this.workspaceData.getEdge(msg['id']);
        e.src = msg['src'];
        e.tgt = msg['tgt'];
        e.metadata = msg['metadata'];

        this.workspaceData.updateEdge(e);
    }
}
