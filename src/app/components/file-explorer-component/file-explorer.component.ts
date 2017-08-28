import {Component, ElementRef, ViewChild} from '@angular/core';
import {WorkspaceService} from '../../services/workspace.service';
import {SocketService} from '../../services/socket.service';
import {TreeNode} from 'angular-tree-component';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {AppService} from '../../services/app.service';

@Component ({
    selector: 'file-explorer',
    templateUrl: './file-explorer.component.html'
})

/**
 * Created by antoine on 23/06/17.
 */
export class FileExplorerComponent {
    @ViewChild('tree') private tree: ElementRef;
    @ViewChild('file') private inputEl: ElementRef;
    eventHub: any;
    nodes: Array<Object>;
    selectedElement: TreeNode;

    readonly URI_TO_FILE_MANAGER_API: string = `http${this.app.serverAddress}/API/file-manager`;


    constructor (private workspaceData: WorkspaceService, private socket: SocketService, private http: Http, private app: AppService) {
        this.nodes = [];

        this.fetchTreeData();
    }


    selectElement ($event: any) {
        this.selectedElement = $event.node;
    }

    pathForNode (node: TreeNode): string {
        let tempNode: TreeNode = node;
        if (node.data.name !== this.workspaceData.workspace.name) {
            let res: string = node.data.name + '/';

            // Add every parent name in the beginning of the path, except the first element because we use
            // the name of the project as the root folder, which is not the case on the backend.
            while (tempNode.realParent !== null && tempNode.realParent.realParent !== null) {
                res = `${tempNode.realParent.data.name}/${res}`;
                tempNode = tempNode.realParent;
            }

            return res;
        } else { return '/'; };
    }

    /* ----------------------------------------------------------------------------
                   METHODS RELATED TO FILE AND DATA MANAGEMENT
     ---------------------------------------------------------------------------- */

    fetchTreeData () {
        // Send request for folder structure
        this.socket.sendFileExplorerGetNodesMsg();
    }

    upload () {
        // First : add each file selected by the user in a FormData object
        const inputEl: HTMLInputElement = this.inputEl.nativeElement;
        const fileCount: number = inputEl.files.length;
        const formData = new FormData();
        if (fileCount > 0) {
            for (let i = 0; i < fileCount; i++) {
                formData.append('file', inputEl.files.item(i));
            }

            // Second : retrieve and configure the path to where the files must be uploaded
            const filePath = this.selectedElement ? this.pathForNode(this.selectedElement) : '/';
            formData.append('path', filePath);
            formData.append('workspace', this.workspaceData.workspace.uuid);

            // Send the post request
            this.http.post(`http${this.app.serverAddress}/API/file-manager`, formData)
                .toPromise()
                .then(() => { this.uploadSuccess(); })
                .catch(this.handleError);
        }
    }

    async newFolder () {
        await this.sleep(10);
        const name = prompt('Folder name');
        const filePath = this.selectedElement ? this.pathForNode(this.selectedElement) : '/';

        const formData = new FormData();
        formData.append('name', name);
        formData.append('path', filePath);
        formData.append('workspace', this.workspaceData.workspace.uuid);

        this.http.put(this.URI_TO_FILE_MANAGER_API, formData)
            .toPromise()
            .then(() => { this.newFolderSuccess(); })
            .catch(this.handleError);
    }

    async delete () {
        await this.sleep(10);
        const workspace = this.workspaceData.workspace.uuid;
        const filePath = this.selectedElement ? this.pathForNode(this.selectedElement) : '/';

        // Send the delete request
        this.http.delete(`http${this.app.serverAddress}/API/file-manager?workspace=${workspace}&path=${filePath}`)
            .toPromise()
            .then(() => { this.deleteSuccess(); })
            .catch(this.handleError);
    }

    uploadSuccess () {
        this.fetchTreeData();
        alert('Files successfully uploaded');
    }

    newFolderSuccess () {
        this.fetchTreeData();
    }

    deleteSuccess () {
        this.fetchTreeData();
    }

    handleError (error: any): Promise<any> {
        console.error('An error occured while uploading the files', error);
        alert(error);
        return Promise.reject(error.message || error);
    }

    /* ----------------------------------------------------------------------------
                 SET EVENT HUB, COMMON TO ALL COMPONENTS IN THIS APP
     ---------------------------------------------------------------------------- */

    setEventHub (eventHub: any) {
        this.eventHub = eventHub;

        // Subscribe to events

    }

    /* ----------------------------------------------------------------------------
     METHODS TO CREATE SLEEP
     ---------------------------------------------------------------------------- */

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
