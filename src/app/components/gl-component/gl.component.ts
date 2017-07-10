/**
 * Created by antoine on 07/06/17.
 */

import {
    Component, ComponentFactoryResolver, HostListener, ViewContainerRef,
    ElementRef, ViewChild, NgZone, OnInit
} from '@angular/core';
import { FlowComponent } from '../flow-component/flow.component';
import { FlowNodesListComponent} from '../flow-nodes-list-component/flow-nodes-list.component';
import { CodeEditorComponent } from '../code-editor-component/code-editor.component';
import { ChartComponent } from '../chart-component/chart.component';
import { FileExplorerComponent } from '../file-explorer-component/file-explorer.component';
import { DataImporterComponent } from '../data-importer-component/data-importer.component';
import {AppService} from '../../services/app.service';
import {DataService} from '../../services/data.service';
import * as GoldenLayout from 'golden-layout';
import {Config, ItemConfig} from 'golden-layout';
import {Node} from '../../types/Node';
declare var $: JQueryStatic;

@Component({
    selector: 'golden-layout',
    templateUrl: './gl.component.html',
    entryComponents: [FlowComponent, FlowNodesListComponent, CodeEditorComponent, ChartComponent, FileExplorerComponent,
                        DataImporterComponent]
})
export class GLComponent implements OnInit {
    @ViewChild('layout') private layout: any;
    private config: Config;
    private nodeComponentMap: Map<string, string>;

    private rootItem: any;
    private newElementsContainer: any;
    private newElementsContainerItem: ItemConfig;


    constructor(private el: ElementRef, private viewContainer: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver, private zone: NgZone,
                private appService: AppService, private appData: DataService) {

        // Define components id
        this.newElementsContainerItem = {
            type: 'stack',
            id: 'new-elements-container',
            width: 0,
            content: [],
        };

        // Fulfill the nodeComponentMap
        this.nodeComponentMap = new Map();
        this.nodeComponentMap.set('Raw data', 'data-importer');
        this.nodeComponentMap.set('Model', '');
        this.nodeComponentMap.set('Processing', 'code-editor');
        this.nodeComponentMap.set('Simulation', 'code-editor');
        this.nodeComponentMap.set('Visualisation', 'chart');


        appService.start();

        this.config = {
            content: [{
                type: 'row',
                content: [
                    {
                        type: 'stack',
                        width: 22,
                        content: [
                            {
                                type: 'component',
                                componentName: 'flow-nodes-list',
                                id: 'flow-nodes-list'
                            },
                            {
                                type: 'component',
                                componentName: 'file-explorer',
                                id: 'files'
                            },
                        ]
                    },
                    {
                        type: 'component',
                        componentName: 'flow',
                        id: 'flow'
                    }, this.newElementsContainerItem,
                ]
            }]
        };
    }

    async ngOnInit() {
        this.layout = new GoldenLayout(this.config, this.layout.nativeElement);

        // Give the eventHub to the addData service
        this.appData.setEventHub(this.layout.eventHub);

        this.registerLayoutComponent('flow', FlowComponent);

        this.registerLayoutComponent('flow-nodes-list', FlowNodesListComponent);

        this.registerLayoutComponent('chart', ChartComponent);

        this.registerLayoutComponent('code-editor', CodeEditorComponent);

        this.registerLayoutComponent('file-explorer', FileExplorerComponent);

        this.registerLayoutComponent('data-importer', DataImporterComponent);

        // Short sleep to avoid this.layout.root === null
        await this.sleep(100);
        this.layout.init();
        // Store the root item and the new-elements-container
        this.rootItem = this.layout.root.contentItems[0];
        this.newElementsContainer = this.layout.root.getItemsById('new-elements-container')[0];

        this.layout.on('itemDestroyed', (item: any) => {
            if (item.container != null) {
                let compRef = item.container['compRef'];
                if (compRef != null) {
                    compRef.destroy();
                }
            }
        });

        this.configureEventHubListeners();
    } // End onInit

    openWindow (node: Node) {
        // First : verify if the window associated with the node is open.
        // If so, it will focus this window,
        // If not, create it
        if (this.layout.root.getItemsById(node.id)[0]) {
            const item = this.layout.root.getItemsById(node.id)[0];
            item.parent.setActiveContentItem(item);
        } else {
            const newItem = {
                type: 'component',
                id: node.id,
                componentName: this.nodeComponentMap.get(node.component),
                componentState: {},
                title: node.getName() || node.component,
            };

            // Add the node object if it has been passed as a param
            if (node && node !== null) {
                newItem['componentState'] = { node: node };
            }

            // Make sur the new-elements-container is in the layout
            if (!this.layout.root.getItemsById('new-elements-container')[0]) {
                this.rootItem.addChild(this.newElementsContainerItem);
                this.newElementsContainer = this.layout.root.getItemsById('new-elements-container')[0];
            }

            this.newElementsContainer.addChild(newItem);

            // Set the other elements' width to be sure it is comfortable for the user
            if (this.newElementsContainer.contentItems.length === 1) {
                this.newElementsContainer.config['width'] = 80;
                this.layout.updateSize();
            }
        }
    }

    closeWindow (node: Node) {
        const item = this.getGLItem(node);
        if (item !== null) {
            item.remove();
        }
    }

    updateTabName (node: Node) {
        const item = this.getGLItem(node);
        if (item !== null) {
            item.setTitle(node.getName());
        }
    }

    getGLItem (node: Node): any {
        if (this.layout.root.getItemsById(node.id)[0]) {
            const item = this.layout.root.getItemsById(node.id)[0];
            return item;
        } else {
            return null;
        }
    }

    registerLayoutComponent (name: string, component: any) {
        if (this.layout) {
            this.layout.registerComponent(name, (container: any, componentState: Object) => {
                this.zone.run(() => {
                    let factory = this.componentFactoryResolver.resolveComponentFactory(component);

                    let compRef = this.viewContainer.createComponent(factory);

                    window['a'] = compRef.instance;
                    if (compRef.instance['__proto__'].hasOwnProperty('setEventHub')) {
                        compRef.instance['setEventHub'](this.layout.eventHub);
                    }

                    if (compRef.instance['__proto__'].hasOwnProperty('setNodeRef') &&
                        componentState && componentState.hasOwnProperty('node')) {
                        compRef.instance['setNodeRef'](componentState['node']);
                    }

                    container.getElement().append(compRef.location.nativeElement);

                    container['compRef'] = compRef;

                    // Trigger a resize event each time the container size change, in order to resize the flow automatically
                    container.on( 'resize', () => {
                        this.layout.eventHub.emit('resize');
                    });
                    // Trigger a resize event each time the container shows, in order to resize the flow automatically
                    container.on( 'show', async () => {
                        await this.sleep(10);
                        this.layout.eventHub.emit('resize');
                    });
                });
            });
        }
    }

    configureEventHubListeners () {
        this.layout.eventHub.on('openWindow', (node: Node) => {
            this.openWindow(node);
        });

        this.layout.eventHub.on('closeWindow', (node: Node) => {
            this.closeWindow(node);
        });

        this.layout.eventHub.on('blockNameChanged', (node: Node) => {
            this.updateTabName(node);
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        if (this.layout) {
            this.layout.updateSize();
            this.layout.eventHub.emit('resize');
        }
    }

    /* ----------------------------------------------------------------------------
                                METHODS TO CREATE SLEEP
     ---------------------------------------------------------------------------- */

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
