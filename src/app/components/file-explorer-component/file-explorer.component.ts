import {Component, ElementRef, ViewChild} from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {TreeNode} from 'angular-tree-component';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {AppService} from '../../services/app.service';

/**
 * Created by antoine on 23/06/17.
 */

@Component ({
    selector: 'file-explorer',
    templateUrl: './file-explorer.component.html'
})

export class FileExplorerComponent {
    @ViewChild('tree') private tree: ElementRef;
    @ViewChild('file') private inputEl: ElementRef;
    eventHub: any;
    nodes: Array<Object>;
    selectedElement: TreeNode;


    constructor (private appData: DataService, private socket: SocketService, private http: Http, private app: AppService) {
        this.nodes = [];

        // Send request for folder structure
        this.socket.sendFileExplorerGetNodesMsg();
    }

    selectElement ($event: any) {
        this.selectedElement = $event.node;
    }

    pathForNode (node: TreeNode): string {
        let tempNode: TreeNode = node;
        if (node.data.name !== this.appData.workspace.name) {
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

    upload () {
        // First : add each file selected by the user in a FormData object
        const inputEl: HTMLInputElement = this.inputEl.nativeElement;
        const fileCount: number = inputEl.files.length;
        let formData = new FormData();
        if (fileCount > 0) {
            for (let i = 0; i < fileCount; i++) {
                formData.append('file', inputEl.files.item(i));
            }

            // Second : retrieve and configure the path to where the files must be uploaded
            const filePath = this.selectedElement ? this.pathForNode(this.selectedElement) : '/';
            formData.append('path', filePath);
            console.log(filePath);

            // Send the post request
            // TODO : replace localhost with a much cleaner version

            this.http.post(`http${this.app.serverAddress}/API/upload?workspace=${this.appData.workspace.uuid}`, formData)
                .toPromise()
                .then(this.uploadSuccess)
                .catch(this.handleError);
        }
    }

    uploadSuccess () {
        alert('Files successfully uploaded');
    }

    handleError (error: any): Promise<any> {
        console.error('An error occured while uploading the files', error);
        alert(error);
        return Promise.reject(error.message || error);
    }

    setEventHub (eventHub: any) {
        this.eventHub = eventHub;

        // Subscribe to events

    }
}
