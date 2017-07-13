/**
 * Created by antoine on 13/07/17.
 */

import {Component, ViewChild} from '@angular/core';
import {GLComponent} from '../gl-component/gl.component';
import {TopbarComponent} from '../topbar-component/topbar.component';
import {SocketService} from '../../services/socket.service';
import {AppService} from '../../services/app.service';

@Component ({
    selector: 'workspace',
    templateUrl: './workspace.component.html'
})

export class WorkspaceComponent {
    @ViewChild('topbar') private topbar: TopbarComponent;
    @ViewChild('goldenlayout') private goldenlayout: GLComponent;

    workspaceUuid: string;

    constructor (private socket: SocketService, private appService: AppService) {
    }

    /**
     * Connect the app to a workspace
     */
    public connect(id: string) {
        // Connect the websocket, after selecting the workspace
        this.workspaceUuid = id;
        this.socket.connect('ws' + this.appService.serverAddress + '/ws', id);
    }

}
