import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA}      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';

import { GLComponent }   from './components/gl-component/gl.component';
import { AppComponent }  from './app.component';
import { FlowComponent } from './components/flow-component/flow.component';
import { FlowNodesListComponent } from './components/flow-nodes-list-component/flow-nodes-list.component';
import { CodeEditorComponent } from './components/code-editor-component/code-editor.component';
import { MonacoEditorComponent } from './components/code-editor-component/ng2-monaco-editor/ng2-monaco-editor';
import { AppService }    from './app.service';
import { DataService }   from './data-service/data.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ GLComponent, AppComponent, FlowComponent, FlowNodesListComponent, CodeEditorComponent, MonacoEditorComponent ],
  providers:    [ AppService, DataService ],
  schemas:      [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ],
  bootstrap:    [ GLComponent ]
})
export class AppModule { }
