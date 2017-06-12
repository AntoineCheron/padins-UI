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

    constructor(name: String, description: String, subgraph: boolean, inPorts: Array<String>, outPorts: Array<String>) {
        this.name = name;
        this.description = description;
        this.subgraph = subgraph;
        this.inPorts = [];
        this.outPorts = [];

        let that = this;
        inPorts.forEach(function(value) {
            const p: Port = new Port();
            p.type = 'Object';
            p.id = value;

            that.inPorts.push(p);
        });

        outPorts.forEach(function(value) {
            const p: Port = new Port();
            p.type = 'Object';
            p.id = value;

            that.outPorts.push(p);
        });
    }

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
