/**
 * Created by antoine on 07/06/17.
 */

import { Injectable } from '@angular/core';

@Injectable()
export class AppService {
    public count: number = 0;
    serverAddress = '://localhost:8080';
    workspace: Object;
    ws: WebSocket;

    constructor () {
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
                    console.log('Choosed workspace : ' + this.workspace.name);

                    // Connect the websocket
                    this.ws = new WebSocket('ws' + this.serverAddress + '/ws', this.workspace.id);
                    this.ws.onopen = ((ev: Event) => {
                        console.log('Successfully connected to websocket server');
                    });
                    this.ws.onmessage = ((ev: MessageEvent) => {
                        console.log(ev);
                    });
                }
            }
        };

        xhr.open('GET', 'http' + this.serverAddress + '/API/workspaces', true);
        xhr.send();
    }
}
