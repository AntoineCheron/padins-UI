/**
 * Created by antoine on 09/06/17.
 */
import { Port } from './port';

export class Component {
    public name: String;
    public description: String;
    public icon: String;
    public subgraph: boolean;
    public inPorts: Array<Port>;
    public outPorts: Array<Port>;

    getInportsAsStringArray () {
        return this.StringArrayFromPortArray(this.inPorts);
    }

    getOutportsAsStringArray () {
        return this.StringArrayFromPortArray(this.outPorts);
    }

    StringArrayFromPortArray(array: Array<Port>) {
        const res: Array<String> = new Array();

        array.forEach(function(element: Port) {
            res.push(element.id);
        });

        return res;
    }
}
