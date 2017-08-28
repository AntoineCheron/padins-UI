import {FBPMessage} from '../../types/fbp-message';
import {Component} from '../../types/component';
import {Port} from '../../types/port';
import {Injectable} from '@angular/core';
import {WorkspaceService} from '../workspace.service';
/**
 * Handle the messages of the component subprotocol from flow-based programming network protocol.
 *
 * Protocol for handling the component registry.
 *
 * This subprotocol description can be found here :
 * https://flowbased.github.io/fbp-protocol/#component-list
 *
 * Created by antoine on 15/06/2017.
 */

@Injectable()
export class ComponentMessageHandler {


    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService) {
        // Doing nothing for now
        this.workspaceData = workspaceData;
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PUBLIC METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Redirect the given message to the proper handler method.
     *
     * @param msg {Object} the received component message
     */
    handleMessage (msg: Object) {
        const message: FBPMessage = new FBPMessage(msg['protocol'], msg['command'], msg['payload']);

        switch (message.getCommand()) {
            case 'component':
                this.addComponent(message.getPayloadAsJSON());
                break;
            case 'componentsready':
                this.componentsReady();
                break;
            default:
                console.log(`Unknown message on component : ${message.toJSONstring()}`);
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                            PRIVATE METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Add a component to the list of available components. The new component is created from the received data.
     *
     * https://flowbased.github.io/fbp-protocol/#component-component
     *
     * @param msg {Object} the 'component:component' message
     */
    private addComponent (msg: Object) {
        const name = msg['name'].substring(msg['name'].indexOf('/') + 1, msg['name'].length);
        const inPorts: Array<Port> = [];
        const inportsTemp = JSON.parse(msg['inPorts']);
        inportsTemp.forEach((port: Object) => {
            const p: Port = new Port(port['id'], port['public'], port['port'], port['description'], port['node'],
                                    JSON.parse(port['metadata']), port['connectedEdges'], this.workspaceData);
            inPorts.push(p);
        });

        const outPorts: Array<Port> = [];
        const outportsTemp = JSON.parse(msg['outPorts']);
        outportsTemp.forEach((port: Object) => {
            const p: Port = new Port(port['id'], port['public'], port['port'], port['description'], port['node'],
                JSON.parse(port['metadata']), port['connectedEdges'], this.workspaceData);
            outPorts.push(p);
        });

        const component: Component = new Component(name, msg['description'], msg['subgraph'], inPorts, outPorts);

        // Finally add the component into the workspaceData service
        this.workspaceData.addComponent(component);
    }

    /**
     * Confirm that all components have been received.
     *
     * https://flowbased.github.io/fbp-protocol/#component-componentsready
     */
    private componentsReady () {
        this.workspaceData.componentsReady();
    }
}
