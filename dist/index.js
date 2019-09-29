"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var agora_graph_1 = require("agora-graph");
var lodash_1 = __importDefault(require("lodash"));
var javascript_lp_solver_1 = require("javascript-lp-solver");
exports.diamondRotation = function (graph, options) {
    if (options === void 0) { options = { padding: 0 }; }
    var diamonds = lodash_1.default.map(graph.nodes, node2Diamond);
    return { graph: graph };
};
exports.diamondGraphRotation = function (graph, options) {
    if (options === void 0) { options = { padding: 0 }; }
    graph.nodes.sort(function (a, b) { return a.index - b.index; });
    var rotatedNodes = lodash_1.default.map(graph.nodes, function (n) {
        var polar = agora_graph_1.toPolar(n);
        polar.theta += Math.PI / 4;
        var cart = agora_graph_1.toCartesian(polar);
        return __assign(__assign({}, n), cart);
    });
    var vs = lodash_1.default.sortBy(rotatedNodes, 'x');
    var hs = lodash_1.default.sortBy(rotatedNodes, 'y');
    var diamonds = lodash_1.default.map(rotatedNodes, function (n) {
        return node2Diamond(n, lodash_1.default.findIndex(vs, ['index', n.index]), // i'm sure it exists
        lodash_1.default.findIndex(hs, ['index', n.index]) // i'm sure it exists
        );
    });
    var constraints = [];
    // set minimize constraint
    var minimize = lodash_1.default(diamonds)
        .map(function (_a) {
        var index = _a.index, x = _a.x, y = _a.y;
        return "x" + index + " - " + x + " + y" + index + " - " + y;
    })
        .join(' + ');
    constraints.push('min: ' + minimize + ';');
    // sort by index
    diamonds.sort(function (a, b) { return a.index - b.index; });
    // setting up orthogonal constraints
    for (var i = 0; i < diamonds.length; i++) {
        var _a = diamonds[i], index = _a.index, v = _a.v, h = _a.h;
        if (v + 1 < vs.length) {
            // is not last
            // x'_v(i) <= x'_v(i+1)
            constraints.push("x" + index + " - x" + vs[v + 1].index + " <= 0;");
        }
        if (h + 1 < hs.length) {
            // is not last
            // y'_h(i) <= y'_h(i+1)
            constraints.push("y" + index + " - y" + hs[h + 1].index + " <= 0;");
        }
    }
    // sort by x
    diamonds.sort(function (a, b) { return a.x - b.x; });
    for (var iIdx = 0; iIdx < diamonds.length; iIdx++) {
        var _b = diamonds[iIdx], i = _b.index, yi = _b.y, wi = _b.wii;
        for (var jIdx = iIdx + 1; jIdx < diamonds.length; jIdx++) {
            var _c = diamonds[jIdx], j = _c.index, yj = _c.y, wj = _c.wii;
            // xj >= xi
            if (yi <= yj) {
                //wi is not width
                constraints.push("x" + j + " - x" + i + " + y" + j + " - y" + i + " >= " + (wi + wj) + ";");
            }
            if (yi >= yj) {
                constraints.push("x" + j + " - x" + i + " + y" + i + " - y" + j + " >= " + (wi + wj) + ";");
            }
        }
    }
    // minimal position constraint
    for (var index = 0; index < diamonds.length; index++) {
        var _d = diamonds[index], i = _d.index, x = _d.x, y = _d.y;
        constraints.push("x" + i + " >= " + x + ";");
        constraints.push("y" + i + " >= " + y + ";");
    }
    var lpsolve = constraints.join('\n');
    // transform to js constraint
    var tmodel = javascript_lp_solver_1.ReformatLP(lpsolve);
    // console.log(lpsolve);
    var solver = javascript_lp_solver_1.Solve(tmodel);
    var feasible = solver.feasible, result = solver.result, bounded = solver.bounded, rest = __rest(solver, ["feasible", "result", "bounded"]);
    // index => {x?: y:?}
    var positions = lodash_1.default.transform(rest, function (result, val, key) {
        var tpe = key.substr(0, 1);
        var index = key.substr(1);
        (result[index] || (result[index] = {}))[tpe] = val;
    }, {});
    // rotate back to cartesian
    var rotatedPos = {};
    lodash_1.default.forEach(diamonds, function (_a) {
        var index = _a.index, x = _a.x, y = _a.y;
        var position = {
            x: positions[index] && positions[index].x ? positions[index].x : x,
            y: positions[index] && positions[index].y ? positions[index].y : y
        };
        var polar = agora_graph_1.toPolar(position);
        polar.theta -= Math.PI / 4;
        rotatedPos[index] = agora_graph_1.toCartesian(polar);
    });
    // map to nodes
    var updatedNodes = lodash_1.default.map(graph.nodes, function (_a) {
        var index = _a.index, x = _a.x, y = _a.y, rest = __rest(_a, ["index", "x", "y"]);
        return (__assign(__assign({ index: index }, rest), rotatedPos[index]));
    });
    // console.log(JSON.stringify(graph));
    // console.log(JSON.stringify(diamonds));
    // console.log(
    //   JSON.stringify(
    //     diamonds.map(({ wii: width, height, ...d }) => {
    //       const update: any = {};
    //       if (positions[d.index]) {
    //         if (positions[d.index].x) update.x = positions[d.index].x;
    //         if (positions[d.index].y) update.y = positions[d.index].y;
    //       }
    //       return { ...d, ...update, width: width * 2, height: height * 2 };
    //     })
    //   )
    // );
    return { graph: { nodes: updatedNodes, edges: graph.edges } };
};
function node2Diamond(_a, v, h) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height, index = _a.index;
    return {
        index: index,
        x: x,
        y: y,
        v: v,
        h: h,
        wii: (Math.max(height, width) / 2) * Math.SQRT2
    };
}
