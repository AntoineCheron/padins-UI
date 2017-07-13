import { AppService } from '../../services/app.service';
import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
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

    showCreateNewWorkspaceModal = false;

    constructor (private appService: AppService, private router: Router, private appData: DataService) {

    }

    ngOnInit () {
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
        this.router.navigate(['/workspace', id]);
    }

    nextBackgroundColor (id: string): string {
        return this.backgroundColors[parseFloat(id.replace(/[a-f-]/g, '')) % this.backgroundColors.length] || '';
    }

    openWorkspaceCreationModal () {

    }

}
