import { Component } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { Colors } from './chart.colors';
import { Node } from '../../types/node';
import { Chart } from '../../types/chart';
import { Underscore } from 'underscore';
declare let _: Underscore<any>;

@Component({
    selector: 'chart-component',
    templateUrl: './chart.component.html'
})

/**
 * This component is used as a sub-component of the workspace component. It is registered in the GoldenLayout component.
 * It is the detailed view of a 'visualization' node.
 *
 * The Chart Component takes all the data of the nodes connected to its linked node's input and make them available
 * for display in a chart. All these data can be used either as a data on the y-axis and x-axis and the type of chart
 * can be chosen between a lot of options, such as line, pie, area, etc.
 *
 * Also, this component can display matrices as videos. When the user wants to display a matrice, she can't display
 * any other data on the chart.
 *
 * @uses [HighCharts](https://www.highcharts.com/)
 * @todo : Re-imagine the component to make it closer to Matlab's components and Matplotlib for Python.
 *
 * Created by antoine on 13/06/17.
 */
export class ChartComponent {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    options: Object; // The highcharts option object : http://api.highcharts.com/highcharts/
    chartInstance: any;
    chart: Chart;
    eventHub: any;
    nodeRef: Node;
    data: Object;
    Object: Object = Object; // Trick to use Object in the template

    // Selected options for chart attributes
    display: boolean = false;

    // Chart available options related attributes
    chartTypes: Array<string> = ['line', 'pie', 'area', 'areaspline', 'bar', 'column', 'scatter', 'spline'];

    // Matrice related attributes
    isMatrice: boolean = false;
    matriceObject: Array<Array<number>> = null;
    matriceMax: number = 0;
    matriceMin: number = 0;
    reversedMatrice: boolean = false;
    nbOfMatrices = 0;
    sliderMax: number = 0;
    sliderValue: number = 0;
    sliderName: string = '';
    playing: boolean = false;
    playingInterval: number;
    changeAbscissaAlert: boolean = false;

    /* -----------------------------------------------------------------------------------------------------------------
                                             CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private workspaceData: WorkspaceService) {
        this.chart = new Chart();
        this.data = {};
        // Set the vue params
        if (this.chart) { this.chart.type = this.chartTypes[0]; }

        // Set the chart up
        this.display = false;
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                         HIGHCHARTS RELATED METHODS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Store the chartInstance passed by the highcharts component
     *
     * @param chartInstance {any} passed by the highcharts component
     */
    saveInstance(chartInstance: any) {
        this.chartInstance = chartInstance;
    }

    /**
     * Compute the chart options object that reflect the user's choices, needed for the highcharts component and update
     * it in this.
     */
    computeChartOptions () {
        this.updateDataFromInports();

        /* Scan the results to see whether there are matrices and/or only
         one dimension variables */
        const selectedResultsValues: Array<string> = [];
        this.chart.selectedResults.forEach(value => {
            if (this.data.hasOwnProperty(value)) {
                selectedResultsValues.push(this.data[value]);
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
            if (this.data.hasOwnProperty(this.chart.selectedResults[0])) {
                this.matriceObject = this.data[this.chart.selectedResults[0]];
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

    /* -----------------------------------------------------------------------------------------------------------------
                                            VIEW RELATED METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Called when the user select the data she wants to display on the y-axis. Update the chart accordingly by
     * computing the options object.
     *
     * @param event {any} browser's generated event
     */
    selectedYAxis (event: any) {
        this.chart.selectedResults = [];

        const selectedOptions: HTMLCollection = event.target.selectedOptions;

        for (let i = 0; i < selectedOptions.length; i++) {
            this.chart.selectedResults.push(selectedOptions[i]['value']);
        }

        this.computeChartOptions();
    }

    /**
     * Set the x-axis name. Update the chart accordingly by computing the options object.
     *
     * @param name {string} the name to use
     */
    setXAxisName (name: string) {
        const options = {};
        Object.assign(options, this.options);

        options['xAxis']['title'] = { text: name};

        this.options = options;
    }

    /**
     * Called when the slider's value change. Update the chart accordingly by
     * computing the options object.
     *
     * @param value {number} the slider's value
     */
    handleSliderChange (value: number) {
        // Just need to change the value in the serie of the chart
        if (this.options && this.options.hasOwnProperty('series')) {
            const newSerie = this.options['series'][0];
            if (value <= this.matriceObject.length) {
                newSerie.data = this.matriceObject[value - 1].map(Number);
            } else {
                this.sliderValue = 1;
                newSerie.data = this.matriceObject[0].map(Number);
            }
            this.options['series'][0] = newSerie;
            this.chartInstance.series[0].setData(newSerie.data, true);
        }
    }

    /**
     * Reverse the displayed matrice. It means that instead of using columns as the data to display on the chart,
     * it uses the rows. The opposite is true too.
     */
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

    /**
     * When displaying a matrice, increase the slider's value by one to display next column or row of the matrice,
     * depending on the direction to browse the matrice.
     */
    addOneToAbscissa () {
        this.sliderValue ++;
        this.handleSliderChange(this.sliderValue);
    }

    /**
     * When displaying a matrice, decrease the slider's value by one to display previous column or row of the matrice,
     * depending on the direction to browse the matrice.
     */
    removeOneToAbscissa () {
        this.sliderValue --;
        this.handleSliderChange(this.sliderValue);
    }

    /**
     *  Generates the options object used by highcharts, from the already computed parameters to use. Those parameters
     *  are computed in this.computeChartOptions().
     *
     *  This method should be used in this.computeChartOptions().
     *
     * @returns {object} Highchart's compliant options
     */
    generateOptionObject (): object {
        // Prepare the xAxis
        let xAxis = '';
        if (this.data.hasOwnProperty(this.chart.abscissa)) {
            xAxis = this.data[this.chart.abscissa].map(Number);
        }


        // Prepare the yAxis and title that will be input into the options object
        // The results (ordinates) are all the data array minus the first element
        const yAxisSeries = [];
        let maxSerieSize = 0;
        let yAxisTitle = '';
        const colors = new Colors();

        for (let i = 0; i < this.chart.selectedResults.length ; i++) {
            let serieLength = 0;
            if (this.data.hasOwnProperty(this.chart.selectedResults[i])) {
                serieLength = this.data[this.chart.selectedResults[i]].length;
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
            } else if (this.data.hasOwnProperty(this.chart.selectedResults[i])) {
                if (typeof this.data[this.chart.selectedResults[i]] === 'number') {
                    tempYAxisSerie.data = [this.data[this.chart.selectedResults[i]]];
                } else {
                    tempYAxisSerie.data = this.data[this.chart.selectedResults[i]].map(Number);
                }
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
                type: this.chart.type,
                animation: {
                    duration: 100,
                },
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
            options.yAxis['max'] = this.matriceMax;
            options.yAxis['min'] = this.matriceMin;
        }

        // Finished
        return options;
    }

    /**
     * Test whether the given array contains variables that have only one dimension.
     *
     * @param array {Array<any>} the array to use for computations
     * @returns {boolean} True if the array contains variables that have only one dimension.
     */
    containsOneDimensionVariables (array: Array<any>) {
        return this.containsNDimensionsVariables(array, 1);
    }

    /**
     * Test whether the given array contains variables that have only two dimensions.
     *
     * @param array {Array<any>} the array to use for computations
     * @returns {boolean} True if the array contains variables that have two dimensions.
     */
    containsTwoDimensionVariables (array: Array<any>) {
        return this.containsNDimensionsVariables(array, 2);
    }

    /**
     * Start displaying the matrice as a video. It increase the slider value by one every 60 milliseconds.
     */
    play () {
        const step = 60; // In milliseconds

        /* Run the simulation by increasing this.sliderValue by 1 every
         {{step}} milliseconds and adapting the chart accordingly.
         This runs with no end */

        new Promise((resolve) => {
            this.playing = true;
            this.playingInterval = window.setInterval(() => {
                this.sliderValue = this.sliderValue + 1;
                this.handleSliderChange(this.sliderValue);
                if (this.sliderValue === this.sliderMax) {
                    resolve();
                }
            }, step);
        })
        .then(() => {
            this.stopPlaying();
        }).catch(err => {console.error(err); } );

        // And here it is finished :)
    }

    /**
     * Stop the video of the matrice. It clears the interval that increased the slider value by one every 60
     * milliseconds.
     */
    stopPlaying () {
        clearInterval(this.playingInterval);
        this.playing = false;
    }

    /**
     * Generate an info message for the user in case she choose to display one dimension variables and matrices on
     * the same chart.
     *
     * @returns {string} the message to alert
     */
    generateInfoMsgForMultipleNbDimensionsChoice () {
        const oneDimensionVariables = [];
        const matrices = [];
        /* Sort the variables, the one dimension on one side, multiple
         dimensions on the other side */
        for (let i = 0; i < this.chart.selectedResults.length; i++) {
            let nbDimensions = 0;
            if (this.data.hasOwnProperty(this.chart.selectedResults[i])) {
                nbDimensions = this.getNumberOfDimensions(this.data[this.chart.selectedResults[i]]);
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

    /**
     * Method called when the user change the x-axis name or the type of chart. It recomputes the chart options to
     * update the chart accordingly.
     */
    userChangedChartParam () {
        this.computeChartOptions();
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                                OTHER METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Returns true if the given array contains variables that have N dimensions, N being an argument to pass.
     *
     * @param array {Array<any>} the array to use for computation
     * @param n {number} the number of dimensions
     * @returns {boolean} true if the given array contains variables that have N dimensions
     */
    containsNDimensionsVariables (array: Array<any>, n: number) {
        for (let i = 0; i < array.length; i++) {
            if (this.getNumberOfDimensions(array[i]) === n) { return true; }
        }
        return false;
    }

    /**
     * Returns the number of mathematical dimensions of a given variable.
     *
     * @param variable {Array<any>} var to test
     * @returns {number} the number of dimensions of the given variables
     */
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

    /**
     * Update the list of data available for visualization from the inports of the linked node.
     */
    updateDataFromInports () {
        if (this.nodeRef) {
            this.data = this.objectWithoutNestedObjects(this.nodeRef.getPreviousNodesData());
        }
    }

    /**
     * Update the chart's y-axis maximum to match the maximum of the currently displayed chart. When displaying a
     * matrice that has huge gaps between two rows/columns's maximum value, it garanty to the user the ability to
     * zoom in/zoom out in order to display the graph as precisely as possible.
     */
    updateYAxisMax () {
        const options = {};
        Object.assign(options, this.options);
        const series: Array<any> = options['series'];
        let data = [];

        for (let i = 0; i < series.length; i++) {
            data = data.concat(series[i]['data']);
        }

        options['yAxis']['max'] = Math.max.apply(null, data);

        this.options = options;
    }


    /* -----------------------------------------------------------------------------------------------------------------
                                    SETTERS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Set the node this component's instance is linked to.
     *
     * @param node {Node} this component's linked node
     */
    setNodeRef (node: Node) {
        this.nodeRef = node;
        this.data = node.getPreviousNodesData();
        if (!this.data) { this.data = {}; }
    }

    /**
     * Set the eventhub instance to use in order to communicate with the other components, and subscribe to the
     * events useful for this component.
     *
     * Subscribes to :
     * - resize : resize the chart on window's resize
     * - changenode : update the data when the node metadata change. Reminder : the data object is part of the node's
     * metadata
     *
     * @param eventHub {any} the golden layout event hub to use
     */
    setEventHub(hub: any) {
        this.eventHub = hub;

        // Subscribe to events
        this.eventHub.on('resize', () => {
            this.computeChartOptions();
        });

        this.eventHub.on('changenode', (node: Node) => {
            const previousNodes = this.nodeRef.getPreviousNodes();
            let i = -1;
            previousNodes.forEach((n: Node) => {
                if (n.id === node.id) { i = previousNodes.indexOf(n); }
            });

            if (i !== -1) {
                this.computeChartOptions();
            }
        });
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                                UTILS METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Returns the given object as an object with the nested elements at the root of the object.
     *
     * For example :
     * ```javascript
     * let object = {
     *  name: 'foo',
     *  address: {
     *      street: 'bar street',
     *      number: 14,
     *      city: 'Redon'
     *  }
     * }
     * ```
     *
     * Will be transformed into :
     * ```javascript
     * let object = {
     *  name: 'foo',
     *  address.street: 'bar street',
     *  address.number: 14,
     *  address.city: 'Redon'
     * }
     * ```
     *
     * @param object {object} the object to use for computation
     * @returns {object} the same object with the nested elements as root elements
     */
    objectWithoutNestedObjects (object: object): object {
        const res = {};
        for (const key in object) {
            // Skip loop if the property is from prototype
            if (!object.hasOwnProperty(key)) { continue; }

            if (object[key] instanceof Array || typeof object[key] !== 'object') {
                res[key] = object[key];
            } else {
                const newObject = this.objectWithoutNestedObjects(object[key]);
                for (const newKey in newObject) {
                    // Skip loop if the property is from prototype
                    if (!newObject.hasOwnProperty(newKey)) { continue; }

                    res[`${key}.${newKey}`] = newObject[newKey];
                }
            }
        }

        return res;
    }
}
