import { AppService } from '../../services/app.service';
import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppDataService } from '../../services/app-data.service';
import { Http } from '@angular/http';
import {SocketService} from '../../services/socket.service';
/**
 * Created by antoine on 13/07/17.
 */

@Component ({
    selector: 'workspace-chooser',
    templateUrl: './workspace-chooser.component.html'
})

export class WorkspaceChooserComponent implements OnInit {

    workspaces: Array<Object>;
    private backgroundColors = ['yellow-bg', 'green-bg', 'orange-bg', 'blue-bg']; // See app/stylesheets/component-colors.scss

    newWorkspace: object = { name: '' };

    showCreateNewWorkspaceModal = false;

    constructor (private appService: AppService, private router: Router, private appData: AppDataService,
                 private http: Http, private socket: SocketService) {

    }

    ngOnInit () {
        // Set the background of the body to grey
        document.getElementsByTagName('body')[0].classList.remove('white-bg');
        document.getElementsByTagName('body')[0].classList.add('grey-bg');

        // Makes sure the socket used to communicate with a workspace is closed
        this.socket.close();

        // Download the list of workspaces available
        this.fetchWorkspaces();
    }

    fetchWorkspaces () {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    this.workspaces = JSON.parse(xhr.response);
                    this.appData.storeWorkspacesInfo(this.workspaces);
                }
            }
        };

        xhr.open('GET', 'http' + this.appService.serverAddress + '/API/workspaces', true);
        xhr.send();
    }

    onSelectWorkspace (id: string): void {
        // Set the currentWorkspace of the appData
        this.appData.setWorkspace(id);

        // Display the workspace
        this.router.navigate(['/workspace', id]);
    }

    nextBackgroundColor (id: string): string {
        return this.backgroundColors[
            Math.round(parseFloat(id.substring(0, 4).replace(/[a-f-]/g, '')))
            % this.backgroundColors.length
                ] || '';
    }

    createProject () {
        // Close the modal
        this.showCreateNewWorkspaceModal = false;

        // Add the data into a FormData
        const formData = new FormData();
        formData.append('name', this.newWorkspace['name']);

        // Send the request
        this.http.put(`http${this.appService.serverAddress}/API/workspaces`, formData)
            .toPromise()
            .then(() => { this.fetchWorkspaces(); })
            .catch(() => {
                // If an error occurred we prevent the user
                alert('An error occurred while trying to create a new workspace');
            });
    }

}
