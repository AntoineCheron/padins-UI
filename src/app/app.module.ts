import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';

import { GLComponent }   from './gl.component';
import { AppComponent }  from './app.component';
import { App2Component } from './app2.component';
import { AppService }    from './app.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ GLComponent, AppComponent, App2Component ],
  providers:    [ AppService ],
  bootstrap:    [ GLComponent ]
})
export class AppModule { }
