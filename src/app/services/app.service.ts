/**
 * Created by antoine on 07/06/17.
 */

import { Injectable } from '@angular/core';
import {DataService} from './data.service';
import {SocketService} from './socket.service';

@Injectable()
export class AppService {
    serverAddress = '://localhost:8080';

    constructor () {
        const s: string = window.location.href.substring(4);
        const i = s.indexOf('3000');
        if (i !== -1) {
            this.serverAddress = s.substring(0, i);
            this.serverAddress += '8080';
        }
    }
}
