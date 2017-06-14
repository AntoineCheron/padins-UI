/**
 * Created by antoine on 13/06/17.
 */

import { Component } from '@angular/core';
import { DataService } from '../../data-service/data.service';
import { Colors } from './chart.colors';
import { Node } from '../../types/node';
import { Chart } from '../../types/chart';
import { Underscore } from 'underscore';
declare let _: Underscore<any>;

@Component({
    selector: 'chart-component',
    templateUrl: './chart.component.html'
})

export class ChartComponent {
    options: Object; // The highcharts option object : http://api.highcharts.com/highcharts/
    chartInstance: any;
    chart: Chart;
    eventHub: any;
    node: Node;
    data: Object;
    Object: Object = Object; // Trick to use Object in the template

    // Selected options for chart attributes
    display: boolean = false;

    // Chart available options related attributes
    chartTypes: Array<String> = ['line', 'pie', 'area', 'areaspline', 'bar', 'column', 'scatter', 'spline'];

    // Matrice related attributes
    isMatrice: boolean = false;
    matriceObject: Array<Array<number>> = null;
    matriceMax: number = 0;
    matriceMin: number = 0;
    reversedMatrice: boolean = false;
    nbOfMatrices = 0;
    sliderMax: number = 0;
    sliderValue: number = 0;
    playing: boolean = false;
    playingInterval: number;
    changeAbscissaAlert: boolean = false;

    constructor (private appData: DataService) {
        this.chart = new Chart();
        this.data = {};
        this.retrieveDataFromInports();
        // Set the vue params
        if (this.chart) { this.chart.type = this.chartTypes[0]; }

        // Set the chart up
        this.display = false;

        this.activateDemo();
    }

    activateDemo () {
        this.data['a'] = [1, 2, 3, 4, 5];
        this.data['b'] = [[9, 8, 7, 6, 5], [1, 2, 3, 4, 5]];
    }

    saveInstance(chartInstance: any) {
        this.chartInstance = chartInstance;
    }

    computeChartOptions () {
        this.retrieveDataFromInports();

        /* Scan the results to see whether there are matrices and/or only
         one dimension variables */
        const selectedResultsValues: Array<String> = [];
        this.chart.selectedResults.forEach(value => {
            if (this.data.hasOwnProperty(value.toString())) {
                selectedResultsValues.push(this.data[value.toString()]);
            }
        });
        let oneDimensionVariablesFound = this.containsOneDimensionVariables.apply(this, [selectedResultsValues]);
        let twoDimensionsVariablesFound = this.containsTwoDimensionVariables.apply(this, [selectedResultsValues]);

        /* Prepare the chart object for the generateOptionObjectFromChart function
         depending on the kind of variables */
        if (oneDimensionVariablesFound && twoDimensionsVariablesFound) {
            alert( this.generateInfoMsgForMultipleNbDimensionsChoice() );
            this.display = false;
        } else if (oneDimensionVariablesFound && !twoDimensionsVariablesFound) {
            /* Only one dimension variables to display on the chart. No specific
             computation needed. */
            this.isMatrice = false;
            this.display = true;
        } else if (this.nbOfMatrices > 1) {
            // Can't display more than one matrice
            alert('Can\'t display more than one matrice per chart');
            this.display = false;
        } else if (!oneDimensionVariablesFound && !twoDimensionsVariablesFound) {
            // In case the user unselected everything we stop displaying the chart and the matrice-specific buttons
            this.display = false;
            this.isMatrice = false;
        } else {
            // In this case, the user only wants to display a matrice.
            this.isMatrice = true;
            this.display = true;
            if (this.data.hasOwnProperty(this.chart.selectedResults[0].toString())) {
                this.matriceObject = this.data[this.chart.selectedResults[0].toString()];
                console.log(this.matriceObject);
            }

            /* It is possible that the user changed ordinates and/or abscissa
             after having displayed the matrice. In this case, she could have
             reversed the matrice. The following if statement reverse the
             matrice again if the user did it previously. */
            if (this.reversedMatrice) {
                this.reverseMatrice();
            }

            // The abscissa doesn't change

            // First : place the proper data as the slider
            this.sliderMax = this.matriceObject.length;
            // Second : start slider on 1
            if (typeof this.sliderValue !== 'undefined') {
                this.sliderValue = 1;
            }
            // Third : find min and max into matrice
            // (trick : start counting from the 8th point to avoid impact of initial conditions)
            for (let i = 0; i < this.matriceObject.length; i++) {
                const minRow = Math.min.apply(null, this.matriceObject[i]);
                const maxRow = Math.max.apply(null, this.matriceObject[i]);
                this.matriceMin = minRow < this.matriceMin ? minRow : this.matriceMin;
                this.matriceMax = maxRow > this.matriceMax ? maxRow : this.matriceMax;
            }
        }

        // Call this.generateOptionObjectFromChart for the chart to display
        const options = this.generateOptionObject();

        // Finish :D, return the options object for highcharts
        this.options = options;
    }

    /* ----------------------------------------------------------------------------
                                VUE RELATED METHODS
     ---------------------------------------------------------------------------- */

    changeOnResult (eventTarget: any, result: String) {
        if (eventTarget.checked) {
            this.chart.selectedResults.push(result);
        } else {
            this.chart.selectedResults = _.without(this.chart.selectedResults, result);
        }

        this.computeChartOptions();
    }

    handleSliderChange (value: number) {
        // Just need to change the value in the serie of the chart
        if (this.options && this.options.hasOwnProperty('series')) {
            const newSerie = this.options.series[0];
            if (value <= this.matriceObject.length) {
                newSerie.data = this.matriceObject[value - 1].map(Number);
            } else {
                this.sliderValue = 1;
                newSerie.data = this.matriceObject[0].map(Number);
            }
            this.options.series[0] = newSerie;
            this.chartInstance.series[0].setData(newSerie.data, true);
            console.log(this.chartInstance);
        }
    }

    reverseMatrice () {
        if (!this.changeAbscissaAlert) {
            alert('Don\'t forget to change the abscissa');
        }
        // Reverse columns and lines
        const reversedMatrice: Array<Array<number>> = [];
        // First : need to initialize a new array containing empty arrays
        for (let i = 0; i < this.matriceObject[0].length; i++) {
            reversedMatrice[i] = [];
        }
        // Second : actually reverse the matrice
        for (let i = 0; i < this.matriceObject.length; i++) {
            for (let j = 0; j < this.matriceObject[i].length; j++) {
                reversedMatrice[j][i] = this.matriceObject[i][j];
            }
        }
        // Store the newly calculated matrice and adapt slider
        this.reversedMatrice = !this.reversedMatrice;
        this.matriceObject = reversedMatrice;
        this.sliderValue = 1;
        this.sliderMax = this.matriceObject.length;
        this.handleSliderChange(this.sliderValue);
        this.changeAbscissaAlert = !this.changeAbscissaAlert;
    }

    addOneToAbscissa () {
        this.sliderValue ++;
        this.handleSliderChange(this.sliderValue);
    }

    removeOneToAbscissa () {
        this.sliderValue --;
        this.handleSliderChange(this.sliderValue);
    }

    generateOptionObject () {
        // Prepare the xAxis
        let xAxis = '';
        if (this.data.hasOwnProperty(String(this.chart.abscissa))) {
            xAxis = this.data[this.chart.abscissa.toString()].map(Number);
        }


        // Prepare the yAxis and title that will be input into the options object
        // The results (ordinates) are all the data array minus the first element
        const yAxisSeries = [];
        let maxSerieSize = 0;
        let yAxisTitle = '';
        const colors = new Colors();

        for (let i = 0; i < this.chart.selectedResults.length ; i++) {
            let serieLength = 0;
            if (this.data.hasOwnProperty(this.chart.selectedResults[i].toString())) {
                serieLength = this.data[this.chart.selectedResults[i].toString()].length;
            }

            if (serieLength > maxSerieSize) {
                maxSerieSize = serieLength;
            }
            // create an yAxis serie correctly formatted for each data
            const tempYAxisSerie = {
                name: this.chart.selectedResults[i],
                data: new Array<number>(),
                color: colors.nextColor(),
                animation: false
            };
            if (this.isMatrice) {
                tempYAxisSerie.data = this.matriceObject[this.sliderValue - 1].map(Number);
            } else if (this.data.hasOwnProperty(this.chart.selectedResults[i].toString())) {
                tempYAxisSerie.data = this.data[this.chart.selectedResults[i].toString()].map(Number);
            }
            // Add it into the yAxisSeries array
            yAxisSeries.push(tempYAxisSerie);
            // Continue to compute the title
            yAxisTitle += `${this.chart.selectedResults[i]}, `;
        }
        // Make title looking nicer, removing the coma and space at the end
        yAxisTitle = yAxisTitle.slice(0, yAxisTitle.length - 2);

        /* Important step : HERE WE HAVE ALL THE ELEMENTS TO BUILD
         THE OPTIONS OBJECT, LET'S DO THIS*/
        const options = {
            chart: {
                type: this.chart.type
            },
            title: {
                text: `Chart ${this.chart.id}`,
                style: {
                    color: 'white'
                }
            },
            xAxis: {
                categories: xAxis
            },
            yAxis: {
                title: {
                    text: yAxisTitle
                },
                plotLines: [{
                    value: 0,
                    width: 1
                }]
            },
            legend: {
                layout: 'vertical',
                align : 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            plotOptions: {
                series: {
                    turboThreshold: maxSerieSize
                }
            },
            series: yAxisSeries
        };

        // If we have to display a matrice, we fix the yAxis max and min
        if (this.isMatrice) {
            options.yAxis['max'] = parseFloat(String(this.matriceMax));
            options.yAxis['min'] = parseFloat(String(this.matriceMin));
        }

        /* Finished, now we resolve the promise created on the first line
         of this function */
        return options;
    }

    containsOneDimensionVariables (array: Array<any>) {
        return this.containsNDimensionsVariables(array, 1);
    }

    containsTwoDimensionVariables (array: Array<any>) {
        return this.containsNDimensionsVariables(array, 2);
    }

    play () {
        const step = 60; // In milliseconds

        /* Run the simulation by increasing this.sliderValue by 1 every
         {{step}} milliseconds and adapting the chart accordingly.
         This runs with no end */

        new Promise((resolve) => {
            this.playing = true;
            this.playingInterval = window.setInterval(() => {
                this.sliderValue = parseInt(String(this.sliderValue), 10) + 1;
                this.handleSliderChange(this.sliderValue);
                if (parseInt(String(this.sliderValue), 10) === parseInt(String(this.sliderMax), 10)) {
                    resolve();
                }
            }, step);
        })
        .then(() => {
            this.stopPlaying();
        }).catch(err => {console.error(err); } );

        // And here it is finished :)
    }

    stopPlaying () {
        clearInterval(this.playingInterval);
        this.playing = false;
    }

    /* Generate an info message for the user in case she chose to display
     one dimension variables and matrices on the same chart */
    generateInfoMsgForMultipleNbDimensionsChoice () {
        const oneDimensionVariables = [];
        const matrices = [];
        /* Sort the variables, the one dimension on one side, multiple
         dimensions on the other side */
        console.log(this.chart);
        for (let i = 0; i < this.chart.selectedResults.length; i++) {
            let nbDimensions = 0;
            if (this.data.hasOwnProperty(this.chart.selectedResults[i].toString())) {
                nbDimensions = this.getNumberOfDimensions(this.data[this.chart.selectedResults[i].toString()]);
            }

            if (nbDimensions > 1) {
                matrices.push(this.chart.selectedResults[i]);
            } else {
                oneDimensionVariables.push(this.chart.selectedResults[i]);
            }
        }

        // Construct an info text to let the user know which data to choose
        let info = 'Error, impossible to generate a graph with one dimension variables and matrices.\nOne dimension variables are : ';
        for (let index in oneDimensionVariables) {
            if (oneDimensionVariables.hasOwnProperty(index)) {
                info = `${info}${oneDimensionVariables[index]}, `;
            }
        }

        info = info.slice(0, info.length - 2);
        info = info + '\nMatrices are : ';

        for (let index in matrices) {
            if (matrices.hasOwnProperty(index)) {
                info = `${info}${matrices[index]}, `;
            }
        }
        info = info.slice(0, info.length - 2);
        info = info + '.' ;

        return info;
    }

    userChangedChartParam () {
        this.computeChartOptions();
    }

    /* ----------------------------------------------------------------------------
                                    OTHER METHODS
     ---------------------------------------------------------------------------- */

    containsNDimensionsVariables (array: Array<any>, n: number) {
        for (let i = 0; i < array.length; i++) {
            if (this.getNumberOfDimensions(array[i]) === n) { return true; }
        }
        return false;
    }

    // Return the number of mathematical dimensions of a given variable
    getNumberOfDimensions (variable: Array<any>) {
        let nbOfDimensions = 0;
        let temp = variable;

        if (temp.length === undefined) {
            nbOfDimensions = 1;
        } else {
            while (typeof(temp) === 'object') {
                nbOfDimensions++;
                temp = temp[0];
            }
        }

        return nbOfDimensions;
    }

    retrieveDataFromInports () {
        const previousNodes: Array<Node> = this.appData.getPreviousNodes(this.node);
        const data: Object = {};

        if (previousNodes.length !== 0) {
            previousNodes.forEach(node => {
                this.addDataIntoObject(data, node);
            });
        }

        // TODO


    }

    addDataIntoObject  (data: Object, node: Node) {
        const nodeData: any = node.getData();

        nodeData.forEach((element: any) => {
            // TODO : parse and add each variable into the data map
        });
    }


    /* ----------------------------------------------------------------------------
                                    SETTERS
     ---------------------------------------------------------------------------- */

    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
    }

    setNode(node: Node) {

    }
}
