/**
 * A component is something close to the notion of Class in object-oriented programming. When you "instantiate" it,
 * you get a Node.
 *
 * On the UI point of view, the set of components is the library of the different kind of nodes the user can use
 * in order to describes her process. So, each component has a specific behavior.
 *
 * A component is a concept of Flow-Based Programming and its fields are imposed by the FBP.
 *
 * On the backend, there is a library that contains all the components a given workspace can use.
 * This library is in resources/WebUIComponents
 *
 * Created by antoine on 09/06/17.
 */

import { Port } from './port';

export class Component {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    public name: string;
    public className: string;
    public description: string;
    public icon: string;
    public subgraph: boolean;
    public inPorts: Array<Port>;
    public outPorts: Array<Port>;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor(name: string, description: string, subgraph: boolean, inPorts: Array<Port>, outPorts: Array<Port>) {
        this.name = name;
        this.className = name.replace(/\s+/g, '');
        this.description = description;
        this.subgraph = subgraph;
        this.inPorts = inPorts;
        this.outPorts = outPorts;
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                        PUBLIC METHODS / GETTERS AND SETTERS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns the inports of the node formatted as an array of string.
     *
     * @returns {Array<string>} the set of inports of this component
     */
    getInportsAsstringArray (): Array<string> {
        return this.stringArrayFromPortArray(this.inPorts);
    }

    /**
     * Returns the outports of the node formatted as an array of string.
     *
     * @returns {Array<string>} the set of outports of this component
     */
    getOutportsAsstringArray (): Array<string> {
        return this.stringArrayFromPortArray(this.outPorts);
    }

    /**
     * Transform an Array<Port> into an Array<String>.
     * The new array will only contain the names of the ports, not the whole attributes of the Ports.
     *
     * @param array {Array<Port>} the array of port to transform
     * @returns {Array<string>} an array containing each given port's public name
     */
    stringArrayFromPortArray(array: Array<Port>): Array<string> {
        const res: Array<string> = [];

        array.forEach(function(element: Port) {
            res.push(element.publicName);
        });

        return res;
    }
}
