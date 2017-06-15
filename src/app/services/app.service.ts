/**
 * Created by antoine on 07/06/17.
 */

import { Injectable } from '@angular/core';
import {FBPNetworkMessageHandler} from './FBPNetworkMessageHandler.service';
import {FBPMessage} from '../types/FBPMessage';
import {DataService} from './data.service';

@Injectable()
export class AppService {
    public count: number = 0;
    serverAddress = '://localhost:8080';
    workspace: Object;
    ws: WebSocket;
    messageHandler: FBPNetworkMessageHandler;

    constructor (private appData: DataService) {
        this.messageHandler = new FBPNetworkMessageHandler(this.appData);
    }

    public add() {
        this.count = this.count + 1;
    }

    public start() {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const parsedResponse = JSON.parse(xhr.response);
                    this.workspace = parsedResponse[0];
                    console.log(this.workspace);
                    console.log('Choosed workspace : ' + this.workspace.name);

                    // Connect the websocket
                    this.ws = new WebSocket('ws' + this.serverAddress + '/ws', this.workspace.uuid);
                    this.ws.onopen = ((ev: Event) => {
                        console.log('Successfully connected to websocket server');
                        // Right after connexion : request list of available components
                        const msg = new FBPMessage('component', 'list', '');
                        this.ws.send(msg.toJSONString());
                    });
                    this.ws.onmessage = ((ev: MessageEvent) => {
                        this.messageHandler.onMessage(ev);
                    });

                    // TODO on connect :
                    // send component:list
                    // wait for componentsready as an ACK

                }
            }
        };

        xhr.open('GET', 'http' + this.serverAddress + '/API/workspaces', true);
        xhr.send();
    }
}
