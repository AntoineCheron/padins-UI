import {Port} from './port';
/**
 * Created by antoine on 09/06/17.
 */

export class Node {
    id: String;
    component: String;
    metadata: Object;
    graph: String;
    inPorts: Array<Port>;
    outPorts: Array<Port>;
}
