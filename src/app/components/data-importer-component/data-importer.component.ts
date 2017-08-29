import { Component } from '@angular/core';
import { Node } from '../../types/node';
import { SocketService } from '../../services/socket.service';

@Component ({
    selector: 'data-importer',
    templateUrl: './data-importer.component.html'
})

/**
 * This component is used as a sub-component of the workspace component. It is registered in the GoldenLayout component.
 * It is the detailed view of a 'raw-data' node.
 *
 * The data importer component allow a user to import data from .input and .json files and rename them.
 * These data are added into the metadata.data object of the linked node. So, all these data will automatically be
 * sent to the nodes connected to the node's outports.
 *
 *
 * Created by antoine on 29/06/17.
 */
export class DataImporterComponent {

    /* -----------------------------------------------------------------------------------------------------------------
                                            ATTRIBUTES
     -----------------------------------------------------------------------------------------------------------------*/

    eventHub: any;
    data: Object = {}; // The retrieved and stored data
    nodeRef: Node;
    timeout: any;

    fileInputId: string = 'files';

    /* -----------------------------------------------------------------------------------------------------------------
                                            CONSTRUCTOR
     -----------------------------------------------------------------------------------------------------------------*/

    constructor (private socket: SocketService) {

    }

    /* -----------------------------------------------------------------------------------------------------------------
                               PUBLIC METHODS CALLED BY USER ACTIONS ON THE VIEW
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * React to a user's upload file. It redirect the file to the proper handler that will parse it and retrieve its
     * variables.
     *
     * @param e {Event} browser's generated event from the input file HTML element
     */
    uploadedFile (e: Event) {
        // Retrieve the list of files
        const files: FileList = e.target['files'];

        // Redirect each file to the proper handler, looking at its MIME type
        for (let i = 0; i < files.length; i++) {
            const f: File = files[i];

            switch (f.type) {
                case 'text/plain':
                    this.handleTextPlainFile(f);
                    break;
                case '' :
                    if (f.name.substring(f.name.lastIndexOf('.')) === '.input') {
                        this.handleInputFile(f);
                    } else {
                        this.handleUnknownFile(f);
                    }
                    break;
                case 'application/json':
                    this.handleJsonFile(f);
                    break;
                case 'application/vnd.oasis.opendocument.spreadsheet':
                    this.handleODSFile(f);
                    break;
                case 'application/vnd.ms-excel':
                    this.handleExcelFile(f);
                    break;
                default:
                    this.handleUnknownFile(f);
                    break;
            }
        }

        // Empty the files list in order to let the user re-upload the exact same file
        e.target['value'] = '';
    }

    /**
     * Replace the name of a variable with the new given one. Uses a timeout to send the change to the server only
     * after the user didn't type any character for 1 second.
     *
     * @param newKey {string} the new name of the var
     * @param oldKey {string} the old name of the var
     * @param event {any} the browser's generated event
     */
    changeVarName (newKey: string, oldKey: string, event: any) {
        // Update the size param of the input field
        event.target.size = newKey.length;

        const newData = {};
        Object.assign(newData, this.data);
        newData[newKey] = newData[oldKey];
        delete newData[oldKey];

        this.reinitTimeout(newData);
    }

    /**
     * Reinitialize a timer of the timeout that update the node's name and send this change to the server after the user
     * didn't type any character in var's name field for 1 second.
     * @param newData
     */
    reinitTimeout (newData: object) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.data = newData;
            this.nodeRef.setData(newData);
            this.socket.sendChangeNode(this.nodeRef);
        }, 1000);
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                             PARSERS / HANDLERS
     -----------------------------------------------------------------------------------------------------------------*/

    /**
     * Parse the content of plain text file to retrieve the data it contains.
     *
     * @todo
     * @param f {File} the file uploaded by the user
     */
    handleTextPlainFile (f: File) {
        // Try to parse as if it was a Javascript file
    }

    /**
     * Parse the content of an unknown type file to retrieve the data it contains.
     *
     * @todo
     * @param f {File} the file uploaded by the user
     */
    handleUnknownFile (f: File) {

    }

    /**
     * Parse the content of a JSON file to retrieve the data it contains.
     *
     * @param f {File} the file uploaded by the user
     */
    handleJsonFile (f: File) {
        const reader = new FileReader();
        const res = {};
        Object.assign(res, this.data);

        reader.onload = (e) => {
            // Retrieve the text
            const r = reader.result;
            // Parse it
            const result = JSON.parse(r);
            // Add everything into the this.data object
            for (let key in result) {
               if (result.hasOwnProperty(key)) {
                   res[key] = result[key];
               }
            }

            this.data = res;
            this.nodeRef.setData(res);
        };

        reader.readAsText(f);
    }

    /**
     * Parse the content of an ODS file to retrieve the data it contains.
     * ODS are open office sheet files.
     *
     * @todo
     * @param f {File} the file uploaded by the user
     */
    handleODSFile (f: File) {

    }

    /**
     * Parse the content of a .input file to retrieve the data it contains.
     * This type of file is specific to the use case we worked on with Quentin Courtois and Jean-Raynald Dreuzy, two
     * hydrogeology researchers from OSUR Rennes, France. In the future, its better to avoid verify specific file types.
     *
     * Here is an example of a .input file :
     * ```
     * Real morphologic data taken. Slope is assumed constant
     * Hillslope coordinates: X= straight Y= 1
     * x	w	i	z_true	z_mod
     * 0.000000E+00	5.000000E+02	4.991690E-02	0.000000E+00	-1.864152E-16
     * 1.000000E+00	5.000000E+02	4.991690E-02	4.995840E-02	4.995840E-02
     * 2.000000E+00	5.000000E+02	4.991690E-02	9.991679E-02	9.991679E-02
     * 3.000000E+00	5.000000E+02	4.991690E-02	1.498752E-01	1.498752E-01
     * 4.000000E+00	5.000000E+02	4.991690E-02	1.998336E-01	1.998336E-01
     * 5.000000E+00	5.000000E+02	4.991690E-02	2.497920E-01	2.497920E-01
     * ```
     *
     * @param f {File} the file uploaded by the user
     */
    handleInputFile (f: File) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Retrieve the text
            const r = reader.result;
            const text = r.split('\n');
            const result = this.indexOfLineWithVar(text);
            const separator = '	'; // It is a kind of tab, not a space
            // Parse it
            let index = result['index'];
            const keys = [];
            const values = [];
            if (index !== -1) {
                const nbOfVar = result['nbOfVar'];

                let s = text[index];
                // Retrieve the keys
                for (let i = 1; i <= nbOfVar; i++) {
                    let key;
                    if (i < nbOfVar ) {
                        key = s.substring(0, s.indexOf(separator));
                    } else {
                        key = s;
                    }

                    keys[i] = key;
                    values[i] = [];
                    s = s.substring(s.indexOf(separator) + separator.length);
                }

                // Retrieve the values
                index++;
                while (index < text.length) {
                    s = text[index];
                    if (s !== '') {
                        // Add the value of each var except the last one, because the indexOf(separator) is -1 for the last.
                        for (let i = 1; i < nbOfVar; i++) {
                            const value = s.substring(0, s.indexOf(separator));
                            values[i].push(parseFloat(value));
                            s = s.substring(s.indexOf(separator) + separator.length);
                        }
                        // Add the value for the last var
                        // This time value = s
                        if (parseFloat(s) !== NaN) {
                            values[nbOfVar].push(parseFloat(s));
                        }
                    }

                    index++;
                }

                // Create the final object
                const res = {};
                Object.assign(res, this.data);
                for (let i = 1; i <= nbOfVar; i++) {
                    res[keys[i]] = values[i];
                }

                this.data = res;
                this.nodeRef.setData(res);
                this.socket.sendChangeNode(this.nodeRef);
            }
        };

        reader.readAsText(f);
    }

    /**
     * Parse the content of an XSL file to retrieve the data it contains.
     * XSL files are files from Microsoft Excel.
     *
     * @todo
     * @param f {File} the file uploaded by the user
     */
    handleExcelFile (f: File) {

    }

    /* -----------------------------------------------------------------------------------------------------------------
                    SET EVENT METHOD & SET NODE REF COMMON TO ALL COMPONENT USED BY GL-COMPONENT
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * Set the eventhub instance to use in order to communicate with the other components, and subscribe to the
     * events useful for this component.
     *
     * Subscribes to :
     * Nothing
     *
     * @param eventHub {any} the golden layout event hub to use
     */
    setEventHub (eventHub: Event) {
        this.eventHub = eventHub;

        // Subscribing to events
    }

    /**
     * Set the node this component's instance is linked to.
     *
     * @param node {Node} this component's linked node
     */
    setNodeRef (node: Node) {
        this.nodeRef = node;
        this.data = node.getData();
        this.fileInputId = `files-${ node.id }`;
    }

    /* -----------------------------------------------------------------------------------------------------------------
                                                        UTILS METHODS
     ---------------------------------------------------------------------------------------------------------------- */

    /**
     * To use only for .input files !
     * Returns the index of the first line containing variables and the number of lines it contains.
     *
     * Here is an example of a .input file :
     * ```
     * Real morphologic data taken. Slope is assumed constant
     * Hillslope coordinates: X= straight Y= 1
     * x	w	i	z_true	z_mod
     * 0.000000E+00	5.000000E+02	4.991690E-02	0.000000E+00	-1.864152E-16
     * 1.000000E+00	5.000000E+02	4.991690E-02	4.995840E-02	4.995840E-02
     * 2.000000E+00	5.000000E+02	4.991690E-02	9.991679E-02	9.991679E-02
     * 3.000000E+00	5.000000E+02	4.991690E-02	1.498752E-01	1.498752E-01
     * 4.000000E+00	5.000000E+02	4.991690E-02	1.998336E-01	1.998336E-01
     * 5.000000E+00	5.000000E+02	4.991690E-02	2.497920E-01	2.497920E-01
     * ```
     *
     * In this case, the method will return {index: 2, nbOfVar: 5}. If the file contains no var, it will return
     * {index: -1, nbOfVar: null}
     *
     * @param text {Array<string>} the content of the .input file
     * @returns {index: Number, nbOfVar: Number}
     */
    indexOfLineWithVar (text: Array<string>): Object {
        let pattern: RegExp;
        let pattern2: RegExp;
        let i = 0;
        let found = false;
        let nbOfVar = 0;
        let lastNbOfVar = 0;
        let indexOfLineWithVar = -1;
        let stop = false;
        let tempRes;
        let lastIndex;
        while (!found && i < text.length) {
            pattern = new RegExp(/(([a-z-A-Z-0-9\-_\[\]()/\.])+(	)*)/g);
            pattern2 = new RegExp(/(-*[0-9]\.[0-9]{6}E[+\-]{0,1}[0-9]{2}){1}(	)*/g);
            nbOfVar = 0;
            stop = false;
            tempRes = pattern2.exec(text[i]) || pattern.exec(text[i]);
            if (tempRes) { nbOfVar++; }
            lastIndex = pattern.lastIndex > pattern2.lastIndex ? pattern.lastIndex : pattern2.lastIndex;
            pattern2.lastIndex = lastIndex; pattern.lastIndex = lastIndex;
            while (lastIndex < text[i].length && (tempRes = pattern2.exec(text[i]) || pattern.exec(text[i])) && !stop) {
                if (lastIndex !== tempRes.index) {
                    stop = true;
                } else {
                    nbOfVar++;
                    lastIndex = pattern.lastIndex > pattern2.lastIndex ? pattern.lastIndex : pattern2.lastIndex;
                    pattern2.lastIndex = lastIndex; pattern.lastIndex = lastIndex;
                }
            }

            if (!stop) {
                if (nbOfVar === lastNbOfVar) {
                    found = true;
                    indexOfLineWithVar = i - 1;
                } else {
                    lastNbOfVar = nbOfVar;
                }
            } else {
                lastNbOfVar = -1;
            }

            i++;
        }

        if (found) {
            return {index: indexOfLineWithVar, nbOfVar: nbOfVar};
        } else {
            return {index: -1, nbOfVar: null};
        }
    }
}
