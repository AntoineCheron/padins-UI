/**
 * Created by antoine on 07/06/17.
 */

import { Injectable } from '@angular/core';
import {AppDataService} from './app-data.service';
import {SocketService} from './socket.service';

@Injectable()
export class AppService {
    serverAddress: string;

    constructor () {
        this.serverAddress = `://${window.location.hostname}:8080`;
    }
}
