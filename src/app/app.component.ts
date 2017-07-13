import {Component, ViewChild} from '@angular/core';
import {WorkspaceComponent} from './components/workspace-component/workspace.component';
import {AppService} from './services/app.service';
import {DataService} from './services/data.service';
/**
 * Created by antoine on 19/06/2017.
 */

@Component ({
    selector: 'app',
    templateUrl: './app.component.html'
})

export class AppComponent {
    @ViewChild('workspace') private workspace: WorkspaceComponent;

    constructor (private appService: AppService, private appData: DataService) {
        this.start();
    }

    start () {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const parsedResponse = JSON.parse(xhr.response);
                    const workspace = parsedResponse[0];
                    this.appData.storeWorkspaceInfo(workspace);

                    this.openWorkspace(workspace['uuid']);
                }
            }
        };

        xhr.open('GET', 'http' + this.appService.serverAddress + '/API/workspaces', true);
        xhr.send();
    }

    openWorkspace (workspaceUuid: string) {
        this.workspace.connect(workspaceUuid);
    }
}
