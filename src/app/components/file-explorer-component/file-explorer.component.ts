import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../services/data.service';
/**
 * Created by antoine on 23/06/17.
 */

@Component ({
    selector: 'file-explorer',
    templateUrl: './file-explorer.component.html'
})

export class FileExplorerComponent implements OnInit {
    @ViewChild('tree') private tree: ElementRef;
    eventHub: any;


    constructor (private appData: DataService) {
        // TODO : Use it https://angular2-tree.readme.io/docs
    }

    ngOnInit () {
        console.log(this.tree);
        // this.tree.nativeElement.treeview({data: this.getTree()});
    }

    getTree(): Object {
        const tree = [
            {
                text: 'Parent 1',
                nodes: [
                    {
                        text: 'Child 1',
                        nodes: [
                            {
                                text: 'Grandchild 1'
                            },
                            {
                                text: 'Grandchild 2'
                            }
                        ]
                    },
                    {
                        text: 'Child 2'
                    }
                ]
            },
            {
                text: 'Parent 2'
            },
            {
                text: 'Parent 3'
            },
            {
                text: 'Parent 4'
            },
            {
                text: 'Parent 5'
            }
        ];

        return tree;
    }

    setEventHub (eventHub: any) {
        this.eventHub = eventHub;

        // Subscribe to events

    }
}
