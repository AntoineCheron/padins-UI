/**
 * Created by antoine on 07/06/17.
 */

import { Injectable } from '@angular/core';
import {DataService} from './data.service';
import {SocketService} from './socket.service';

@Injectable()
export class AppService {
    serverAddress = '://localhost:8080';
    public workspace: Object = {};

    constructor (private appData: DataService, private socket: SocketService) {
        // Do nothing
    }

    /**
     * Connect the app to a workspace
     */
    public start() {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const parsedResponse = JSON.parse(xhr.response);
                    this.workspace = parsedResponse[0];

                    // Connect the websocket, after selecting the workspace
                    this.socket.connect('ws' + this.serverAddress + '/ws', this.workspace['uuid']);
                }
            }
        };

        xhr.open('GET', 'http' + this.serverAddress + '/API/workspaces', true);
        xhr.send();
    }
}
