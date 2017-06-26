import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA}      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { TopbarComponent } from './components/topbar-component/topbar.component';
import { GLComponent }   from './components/gl-component/gl.component';
import { FlowComponent } from './components/flow-component/flow.component';
import { FlowNodesListComponent } from './components/flow-nodes-list-component/flow-nodes-list.component';
import { CodeEditorComponent } from './components/code-editor-component/code-editor.component';
import { MonacoEditorComponent } from './components/code-editor-component/ng2-monaco-editor/ng2-monaco-editor';
import { ChartComponent } from './components/chart-component/chart.component';
import { FileExplorerComponent } from './components/file-explorer-component/file-explorer.component';

import { ChartModule } from 'angular2-highcharts';
import { TreeModule } from 'angular-tree-component';
import { AppService }    from './services/app.service';
import { DataService }   from './services/data.service';
import { SocketService } from './services/socket.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule, ChartModule.forRoot(require('highcharts')), TreeModule, HttpModule ],
  declarations: [ AppComponent, TopbarComponent, GLComponent, FlowComponent, FlowNodesListComponent, CodeEditorComponent,
                  MonacoEditorComponent, ChartComponent, FileExplorerComponent ],
  providers:    [ AppService, DataService, SocketService ],
  schemas:      [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
