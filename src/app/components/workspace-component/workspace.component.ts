import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { AppService } from '../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';

@Component ({
    selector: 'workspace',
    templateUrl: './workspace.component.html'
})

/**
 * Defines the root component to show a Workspace.
 * It uses the top-bar and golden-layout components to display the workspace.
 *
 * On the functional side, it takes care of changing the body's background color and connect the app to the workspace
 * via a the SocketService.
 *
 * Created by antoine on 13/07/17.
 */
export class WorkspaceComponent implements OnInit {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    workspaceUuid: string;

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private socket: SocketService, private appService: AppService, private route: ActivatedRoute,
                 private workspaceData: WorkspaceService) {
        this.workspaceData.clear();
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                    OnInit INTERFACE METHODS IMPLEMENTATION
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * On init, set the body's background color to white and open a socket connexion to the workspace's endpoint.
     */
    ngOnInit (): void {
        this.setBodyBgToWhite();

        // Connect to the selected workspace
        this.route.params.subscribe((params) => {
            // Connect to the workspace by opening the socket that will permit to communicate with the server
            // providing all the app data
            this.connect(params['uuid']);

            // Set the selected workspace in the app data
            this.workspaceData.setWorkspace(params['uuid']);
        });
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                             PRIVATE METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Connect the app to a workspace
     */
    private connect(id: string): void {
        // Connect the websocket, after selecting the workspace
        this.workspaceUuid = id;
        this.socket.connect('ws' + this.appService.serverAddress + '/ws', id);
        this.workspaceData.setSocket(this.socket);
    }

    /**
     * Set the background color of the body element to white
     */
    private setBodyBgToWhite () {
        document.getElementsByTagName('body')[0].classList.add('white-bg');
        document.getElementsByTagName('body')[0].classList.remove('grey-bg');
    }

}
