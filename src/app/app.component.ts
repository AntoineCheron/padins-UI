import {Component, ViewChild} from '@angular/core';
import {GLComponent} from './components/gl-component/gl.component';
import {TopbarComponent} from './components/topbar-component/topbar.component';
/**
 * Created by antoine on 19/06/2017.
 */

@Component ({
    selector: 'app',
    templateUrl: './app.component.html'
})

export class AppComponent {
    @ViewChild('topbar') private topbar: TopbarComponent
    @ViewChild('goldenlayout') private goldenlayout: GLComponent;
}