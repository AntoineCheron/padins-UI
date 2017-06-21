import {Injectable} from '@angular/core';
import {FBPMessage} from '../../types/FBPMessage';
import {Node} from '../../types/Node';
import {DataService} from '../data.service';
import {Edge} from '../../types/Edge';
/**
 * Created by antoine on 15/06/2017.
 */

@Injectable()
export class GraphMessageHandler {

    constructor (private appData: DataService) {
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
        const n: Node = new Node(msg, this.appData);
        this.appData.addNode(n);
    }

    removeNode (msg: Object) {
        const n: Node = this.appData.getNode(msg['id']);

        this.appData.removeNode(n);
    }

    changeNode (msg: Object) {
        const n: Node = this.appData.getNode(msg['id']);

        // Temporary
        if (msg['metadata'].hasOwnProperty('result') && n.getData() !== msg['metadata']['result']) {
            n.setData(msg['metadata']['result']);
        }

        n.metadata = msg['metadata'];
    }

    addEdge (msg: Object) {
        const e: Edge = new Edge(msg);

        this.appData.addEdge(e);
    }

    removeEdge (msg: Object) {
        const e: Edge = this.appData.getEdge(msg['id']);

        this.appData.removeEdge(e);
    }

    changeEdge (msg: Object) {
        const e: Edge = this.appData.getEdge(msg['id']);
        e.src = msg['src'];
        e.tgt = msg['tgt'];
        e.metadata = msg['metadata'];

        this.appData.updateEdge(e);
    }
}
