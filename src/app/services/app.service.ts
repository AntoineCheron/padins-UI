import { Injectable } from '@angular/core';
import {AppDataService} from './app-data.service';
import {SocketService} from './socket.service';

/**
 * Main service of the app.It only stores the endpoint address.
 *
 * It is an angular default service.
 *
 * Created by antoine on 07/06/17.
 */
@Injectable()
export class AppService {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    serverAddress: string;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor () {
        this.serverAddress = `://${window.location.hostname}:8080`;
    }
}
