import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA}      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';

import { GLComponent }   from './gl-component/gl.component';
import { AppComponent }  from './app.component';
import { App2Component } from './app2.component';
import { FlowComponent } from './flow-component/flow.component';
import { AppService }    from './app.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ GLComponent, AppComponent, App2Component, FlowComponent ],
  providers:    [ AppService ],
  schemas:      [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ],
  bootstrap:    [ GLComponent ]
})
export class AppModule { }
