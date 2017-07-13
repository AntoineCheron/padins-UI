/**
 * Created by antoine on 13/07/17.
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import { GLComponent } from '../gl-component/gl.component';
import { TopbarComponent } from '../topbar-component/topbar.component';
import { SocketService } from '../../services/socket.service';
import { AppService } from '../../services/app.service';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {DataService} from '../../services/data.service';

@Component ({
    selector: 'workspace',
    templateUrl: './workspace.component.html'
})

export class WorkspaceComponent implements OnInit {
    @ViewChild('topbar') private topbar: TopbarComponent;
    @ViewChild('goldenlayout') private goldenlayout: GLComponent;

    workspaceUuid: string;

    constructor (private socket: SocketService, private appService: AppService, private route: ActivatedRoute,
                 private appData: DataService) {

    }

    ngOnInit (): void {
        // Set the background of the body to grey
        document.getElementsByTagName('body')[0].classList.add('white-bg');
        document.getElementsByTagName('body')[0].classList.remove('grey-bg');

        // Connect to the selected workspace
        this.route.params.subscribe((params) => {
            // Connect to the workspace by opening the socket that will permit to communicate with the server
            // providing all the app data
            this.connect(params['uuid']);

            // Set the selected workspace in the app data
            this.appData.setWorkspace(params['uuid']);
        });
    }

    /**
     * Connect the app to a workspace
     */
    connect(id: string): void {
        // Connect the websocket, after selecting the workspace
        this.workspaceUuid = id;
        this.socket.connect('ws' + this.appService.serverAddress + '/ws', id);
    }

}
