/**
 * Created by antoine on 09/06/17.
 */

import { Injectable } from '@angular/core';
import {Component} from '../fbp-data-classes/component';
import {Edge} from '../fbp-data-classes/edge';

@Injectable()
export class DataService {
    public components: Map<String, Component>;
    public nodes: Array<Node>;
    public edges: Array<Edge>;

    constructor() {
        this.components = new Map();
        this.nodes = new Array();
    }

    getComponents () {
        return this.components;
    }

    getNodes () {
        return this.nodes;
    }

    getEdges () {
        return this.edges;
    }
}
