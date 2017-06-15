/**
 * Created by antoine on 09/06/17.
 */
import { Port } from './Port';

export class Component {
    public name: string;
    public className: string;
    public description: string;
    public icon: string;
    public subgraph: boolean;
    public inPorts: Array<Port>;
    public outPorts: Array<Port>;

    constructor(name: string, description: string, subgraph: boolean, inPorts: Array<Port>, outPorts: Array<Port>) {
        this.name = name;
        this.className = name.replace(/\s+/g, '');
        this.description = description;
        this.subgraph = subgraph;
        this.inPorts = inPorts;
        this.outPorts = outPorts;
    }

    getInportsAsStringArray () {
        return this.stringArrayFromPortArray(this.inPorts);
    }

    getOutportsAsStringArray () {
        return this.stringArrayFromPortArray(this.outPorts);
    }

    stringArrayFromPortArray(array: Array<Port>) {
        const res: Array<string> = new Array();

        array.forEach(function(element: Port) {
            res.push(element.publicName);
        });

        return res;
    }
}
