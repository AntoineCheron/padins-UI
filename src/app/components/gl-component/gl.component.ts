/**
 * Created by antoine on 07/06/17.
 */

import {
    Component, ComponentFactoryResolver, HostListener, ViewContainerRef,
    ElementRef, ViewChild, NgZone, OnInit
} from '@angular/core';
import { WorkflowComponent } from '../workflow-component/workflow.component';
import { FlowNodesListComponent} from '../flow-nodes-list-component/flow-nodes-list.component';
import { CodeEditorComponent } from '../code-editor-component/code-editor.component';
import { ChartComponent } from '../chart-component/chart.component';
import { FileExplorerComponent } from '../file-explorer-component/file-explorer.component';
import { DataImporterComponent } from '../data-importer-component/data-importer.component';
import { WorkspaceService } from '../../services/workspace.service';
import * as GoldenLayout from 'golden-layout';
import {Config, ItemConfig} from 'golden-layout';
import {Node} from '../../types/node';
declare var $: JQueryStatic;

@Component({
    selector: 'golden-layout',
    templateUrl: './gl.component.html',
    entryComponents: [WorkflowComponent, FlowNodesListComponent, CodeEditorComponent, ChartComponent, FileExplorerComponent,
                        DataImporterComponent]
})
export class GLComponent implements OnInit {
    @ViewChild('layout') private layout: any;
    private config: Config;
    private nodeComponentMap: Map<string, string>;

    private rootItem: any;
    private newElementsContainer: any;
    private newElementsContainerItem: ItemConfig;

    // Constants
    private readonly COMPONENTS_LIST_WINDOW_ID = 'flow-nodes-list';
    private readonly FILE_EXPLORER_WINDOW_ID = 'files';
    private readonly GRAPH_WINDOW_ID = 'workflow';


    constructor(private el: ElementRef, private viewContainer: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver, private zone: NgZone,
                private workspaceData: WorkspaceService) {

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

        this.config = {
            content: [{
                type: 'row',
                id: 'rootEl',
                content: [
                    {
                        type: 'stack',
                        id: 'main-stack',
                        width: 30,
                        content: [
                            {
                                type: 'component',
                                componentName: 'flow-nodes-list',
                                id: this.COMPONENTS_LIST_WINDOW_ID,
                                title: 'List of components'
                            },
                            {
                                type: 'component',
                                componentName: 'file-explorer',
                                id: this.FILE_EXPLORER_WINDOW_ID,
                                title: 'Files'
                            },
                        ]
                    },
                    {
                        type: 'component',
                        componentName: 'workflow',
                        id: this.GRAPH_WINDOW_ID,
                        title: 'Graph'
                    },
                ]
            }]
        };
    }

    async ngOnInit() {
        this.layout = new GoldenLayout(this.config, this.layout.nativeElement);

        // Give the eventHub to the addData service
        this.workspaceData.setEventHub(this.layout.eventHub);

        this.registerLayoutComponent('workflow', WorkflowComponent);

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
                this.addToRoot(this.newElementsContainerItem);
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

    showGraph () {
        if (this.layout.root.getItemsById(this.GRAPH_WINDOW_ID)[0]) {
            // If the window is open we show it
            const item = this.layout.root.getItemsById(this.GRAPH_WINDOW_ID)[0];
            item.parent.setActiveContentItem(item);
        } else {
            // Otherwise we create it
            const newItem = {
                type: 'component',
                id: this.GRAPH_WINDOW_ID,
                componentName: 'workflow',
                componentState: {},
                title: 'Graph',
            };

            // and add it onto the graph
            this.addToRoot(newItem);
        }
    }

    showComponentsList () {
        if (this.layout.root.getItemsById(this.COMPONENTS_LIST_WINDOW_ID)[0]) {
            // If the window is open we show it
            const item = this.layout.root.getItemsById(this.COMPONENTS_LIST_WINDOW_ID)[0];
            item.parent.setActiveContentItem(item);
        } else {
            // Otherwise we create it
            const newItem = {
                type: 'component',
                id: this.COMPONENTS_LIST_WINDOW_ID,
                componentName: 'flow-nodes-list',
                componentState: {},
                title: 'List of components',
            };

            // and add it onto the graph
            this.addToMainStack(newItem);
        }
    }

    showFileExplorer () {
        if (this.layout.root.getItemsById(this.FILE_EXPLORER_WINDOW_ID)[0]) {
            // If the window is open we show it
            const item = this.layout.root.getItemsById(this.FILE_EXPLORER_WINDOW_ID)[0];
            item.parent.setActiveContentItem(item);
        } else {
            // Otherwise we create it
            const newItem = {
                type: 'component',
                id: this.FILE_EXPLORER_WINDOW_ID,
                componentName: 'file-explorer',
                componentState: {},
                title: 'Files',
            };

            // and add it onto the graph
            this.addToMainStack(newItem);
        }
    }

    addToRoot (item: object) {
        if (this.layout.root.getItemsById('rootEl')[0]) {
            const root = this.layout.root.getItemsById('rootEl')[0];
            root.addChild(item);
        } else {
            this.reconfigureLayout();
            this.addToRoot(item);
        }

        this.layout.updateSize();
    }

    reconfigureLayout () {
        // Retrieve the first childItem of the root element
        const actualRootEl = this.layout.root.contentItems[0];
        // If this element is not a row, we add all its child into a row
        if (!actualRootEl) {
            // Create the row that will server as root element
            const rootEl = { type: 'row', id: 'rootEl', content: []};
            this.layout.root.addChild(rootEl);
        } else if (!actualRootEl.isRow) {
            // Create the row
            const rootEl = { type: 'row', id: 'rootEl', content: []};
            // Replace the actualRootEl with the new one we just created
            this.layout.root.replaceChild(actualRootEl, rootEl);
            // Add the existing elements into the content of rootEl
            this.layout.root.contentItems[0].addChild(actualRootEl);
        } else {
            actualRootEl.id = 'rootEl';
        }
    }

    addToMainStack (item: object) {
        if (this.layout.root.getItemsById('main-stack')[0]) {
            const mainStack = this.layout.root.getItemsById('main-stack')[0];
            mainStack.addChild(item);
        } else if (this.layout.root.getItemsById('rootEl').length === 0) {
            this.reconfigureLayout();
            this.layout.root.contentItems[0].addChild({type: 'stack', id: 'main-stack', width: 30, content: [] });
            const mainStack = this.layout.root.getItemsById('main-stack')[0];
            mainStack.addChild(item);
        } else {
            this.addToRoot(item);
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

                    // Trigger a resize event each time the container size change, in order to resize the workflow automatically
                    container.on( 'resize', () => {
                        this.layout.eventHub.emit('resize');
                    });
                    // Trigger a resize event each time the container shows, in order to resize the workflow automatically
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

        this.layout.eventHub.on('gl-component:show-graph', () => {
            this.showGraph();
        });

        this.layout.eventHub.on('gl-component:show-components-list', () => {
            this.showComponentsList();
        });

        this.layout.eventHub.on('gl-component:show-file-explorer', () => {
            this.showFileExplorer();
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
