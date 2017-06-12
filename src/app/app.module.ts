import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA}      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';

import { GLComponent }   from './components/gl-component/gl.component';
import { AppComponent }  from './app.component';
import { App2Component } from './app2.component';
import { FlowComponent } from './components/flow-component/flow.component';
import { FlowNodesListComponent } from './components/flow-nodes-list-component/flow-nodes-list';
import { AppService }    from './app.service';
import { DataService }   from './data-service/data.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ GLComponent, AppComponent, App2Component, FlowComponent, FlowNodesListComponent ],
  providers:    [ AppService, DataService ],
  schemas:      [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ],
  bootstrap:    [ GLComponent ]
})
export class AppModule { }
