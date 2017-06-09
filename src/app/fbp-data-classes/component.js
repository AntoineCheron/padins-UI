"use strict";
var Component = (function () {
    function Component() {
    }
    Component.prototype.getInportsAsStringArray = function () {
        return this.StringArrayFromPortArray(this.inPorts);
    };
    Component.prototype.getOutportsAsStringArray = function () {
        return this.StringArrayFromPortArray(this.outPorts);
    };
    Component.prototype.StringArrayFromPortArray = function (array) {
        var res = new Array();
        array.forEach(function (element) {
            res.push(element.id);
        });
        return res;
    };
    return Component;
}());
exports.Component = Component;
//# sourceMappingURL=component.js.map