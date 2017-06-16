import {FBPMessage} from '../../types/FBPMessage';
import {Component} from '../../types/Component';
import {Port} from '../../types/Port';
import {DataService} from '../../services/data.service';
import {Injectable} from '@angular/core';
/**
 * Created by antoine on 15/06/2017.
 */

@Injectable()
export class ComponentMessageHandler {

    constructor (private appData: DataService) {
        // Doing nothing for now
        this.appData = appData;
    }

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

    addComponent (msg: Object) {
        const name = msg['name'].substring(msg['name'].indexOf('/') + 1, msg['name'].length);
        const inPorts: Array<Port> = [];
        const inportsTemp = JSON.parse(msg['inPorts']);
        inportsTemp.forEach((port: Object) => {
            const p: Port = new Port(port['id'], port['public'], port['port'], port['description'], port['node'],
                                    JSON.parse(port['metadata']), port['connectedEdge']);
            inPorts.push(p);
        });

        const outPorts: Array<Port> = [];
        const outportsTemp = JSON.parse(msg['outPorts']);
        outportsTemp.forEach((port: Object) => {
            const p: Port = new Port(port['id'], port['public'], port['port'], port['description'], port['node'],
                JSON.parse(port['metadata']), port['connectedEdge']);
            outPorts.push(p);
        });

        const component: Component = new Component(name, msg['description'], msg['subgraph'], inPorts, outPorts);

        // Finally add the component into the appData service
        this.appData.addComponent(component);
    }

    componentsReady () {
        this.appData.componentsReady();
    }
}
