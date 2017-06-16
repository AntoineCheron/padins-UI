import {Injectable} from '@angular/core';
import {FBPMessage} from '../../types/FBPMessage';
import {Node} from '../../types/Node';
import {DataService} from '../data.service';
import {Edge} from "../../types/Edge";
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
            default:
                console.log(`Unknown message on component : ${message.toJSONstring()}`);
        }
    }

    addNode (msg: Object) {
        const n: Node = new Node(msg);

        this.appData.addNode(n);
    }

    addEdge (msg: Object) {
        const e: Edge = new Edge(msg);

        this.appData.addEdge(e);
    }
}
