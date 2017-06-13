/**
 * Created by antoine on 13/06/17.
 */

import { Component } from '@angular/core';
import {DataService} from '../../data-service/data.service';

@Component({
    selector: 'chart-component',
    templateUrl: './chart.component.html'
})

export class ChartComponent {
    // Props are : chartData, ChartList, ChartObject

    options: Object; // The highcharts option object : http://api.highcharts.com/highcharts/
    resultsNames: Array<String>; // TODO : change String to result (and create result type)
    eventHub: any;
    chartObject: Object;
    chartData: Array<String>;
    selectedAbscissa: String = '';
    chartList: Array<String>;
    selectedChartType: String;

    constructor (private appData: DataService) {
        // Set the vue params
        if (this.chartList) { this.selectedChartType = this.chartList[0]; }

        // Set the chart up
        this.options = {
            title : { text: 'simple chart' },
            series: [{
                data: [29.9, 71.5, 106.4, 129.2],
            }]
        };

        this.activateDemo();
    }

    activateDemo () {
        // TODO
    }

    /* ----------------------------------------------------------------------------
                                VUE RELATED METHODS
     ---------------------------------------------------------------------------- */

    changeOnResult (eventTarget: any, result: String) {
        eventTarget.checked ? this.selectResult(result, true) : this.selectResult(result, false);
    }


    /* ----------------------------------------------------------------------------
                                    SETTERS
     ---------------------------------------------------------------------------- */

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
    }
}
