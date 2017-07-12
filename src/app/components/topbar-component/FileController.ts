import {DataService} from '../../services/data.service';
/**
 * Created by antoine on 12/07/17.
 */

export class FileController {
    private appData: DataService;

    constructor (appData: DataService) {
        this.appData = appData;
    }

    // For all the show*** methods : send an event, intercepted by the gl-component

    showGraph () {
        this.appData.eventHub.emit('gl-component:show-graph');
    }

    showComponentsList () {
        this.appData.eventHub.emit('gl-component:show-components-list');
    }

    showFileExplorer () {
        this.appData.eventHub.emit('gl-component:show-file-explorer');
    }
}
