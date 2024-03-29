import { toPolar, toCartesian } from 'agora-graph';
import _ from 'lodash';
import lpsolver from 'javascript-lp-solver';

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var _excluded = ["feasible", "result", "bounded"],
  _excluded2 = ["index", "x", "y"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var diamondGraphRotation = function diamondGraphRotation(graph) {
  graph.nodes.sort(function (a, b) {
    return a.index - b.index;
  });
  var rotatedNodes = _.map(graph.nodes, function (n) {
    var polar = toPolar(n);
    polar.theta += Math.PI / 4;
    var cart = toCartesian(polar);
    return _objectSpread(_objectSpread({}, n), cart);
  });
  var vs = _.sortBy(rotatedNodes, 'x');
  var hs = _.sortBy(rotatedNodes, 'y');
  var diamonds = _.map(rotatedNodes, function (n) {
    return node2Diamond(n, _.findIndex(vs, ['index', n.index]),
    // i'm sure it exists
    _.findIndex(hs, ['index', n.index]) // i'm sure it exists
    );
  });

  var constraints = [];

  // set minimize constraint
  var minimize = _(diamonds).map(function (_ref) {
    var index = _ref.index,
      x = _ref.x,
      y = _ref.y;
    return "x".concat(index, " - ").concat(x, " + y").concat(index, " - ").concat(y);
  }).join(' + ');
  constraints.push('min: ' + minimize + ';');

  // sort by index
  diamonds.sort(function (a, b) {
    return a.index - b.index;
  });

  // setting up orthogonal constraints
  for (var i = 0; i < diamonds.length; i++) {
    var _diamonds$i = diamonds[i],
      index = _diamonds$i.index,
      v = _diamonds$i.v,
      h = _diamonds$i.h;
    if (v + 1 < vs.length) {
      // is not last
      // x'_v(i) <= x'_v(i+1)
      constraints.push("x".concat(index, " - x").concat(vs[v + 1].index, " <= 0;"));
    }
    if (h + 1 < hs.length) {
      // is not last
      // y'_h(i) <= y'_h(i+1)
      constraints.push("y".concat(index, " - y").concat(hs[h + 1].index, " <= 0;"));
    }
  }

  // sort by x
  diamonds.sort(function (a, b) {
    return a.x - b.x;
  });
  for (var iIdx = 0; iIdx < diamonds.length; iIdx++) {
    var _diamonds$iIdx = diamonds[iIdx],
      _i = _diamonds$iIdx.index,
      yi = _diamonds$iIdx.y,
      wi = _diamonds$iIdx.wii;
    var ymax = null;
    var ymin = null;
    for (var jIdx = iIdx + 1; jIdx < diamonds.length; jIdx++) {
      var _diamonds$jIdx = diamonds[jIdx],
        j = _diamonds$jIdx.index,
        yj = _diamonds$jIdx.y,
        wj = _diamonds$jIdx.wii;

      // xj >= xi
      if (yi <= yj && (ymax === null || yj <= ymax)) {
        //wi is not width
        constraints.push("x".concat(j, " - x").concat(_i, " + y").concat(j, " - y").concat(_i, " >= ").concat(wi + wj, ";"));
        ymax = yj;
      }
      if (yi >= yj && (ymin === null || yj >= ymin)) {
        constraints.push("x".concat(j, " - x").concat(_i, " - y").concat(j, " + y").concat(_i, " >= ").concat(wi + wj, ";"));
        ymin = yj;
      }
    }
  }

  // minimal position constraint
  for (var _index = 0; _index < diamonds.length; _index++) {
    var _diamonds$_index = diamonds[_index],
      _i2 = _diamonds$_index.index,
      x = _diamonds$_index.x,
      y = _diamonds$_index.y;
    constraints.push("x".concat(_i2, " >= ").concat(x, ";"));
    constraints.push("y".concat(_i2, " >= ").concat(y, ";"));
  }

  // transform to js constraint
  var lpsolve = constraints.join('\n');
  var tmodel = lpsolver.ReformatLP(lpsolve);

  // console.log(lpsolve);
  var solver = lpsolver.Solve(tmodel);
  solver.feasible;
    solver.result;
    solver.bounded;
    var rest = _objectWithoutProperties(solver, _excluded);
  // index => {x?: y:?}
  var positions = _.transform(rest, function (result, val, key) {
    var tpe = key.substr(0, 1);
    var index = key.substr(1);
    (result[index] || (result[index] = {}))[tpe] = val;
  }, {});

  // rotate back to cartesian
  var rotatedPos = {};
  _.forEach(diamonds, function (_ref2) {
    var index = _ref2.index,
      x = _ref2.x,
      y = _ref2.y;
    var position = {
      x: positions[index] && positions[index].x ? positions[index].x : x,
      y: positions[index] && positions[index].y ? positions[index].y : y
    };
    var polar = toPolar(position);
    polar.theta -= Math.PI / 4;
    rotatedPos[index] = toCartesian(polar);
  });

  // map to nodes
  var updatedNodes = _.map(graph.nodes, function (_ref3) {
    var index = _ref3.index;
      _ref3.x;
      _ref3.y;
      var rest = _objectWithoutProperties(_ref3, _excluded2);
    return _objectSpread(_objectSpread({
      index: index
    }, rest), rotatedPos[index]);
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
  return {
    graph: {
      nodes: updatedNodes,
      edges: graph.edges
    }
  };
};
function node2Diamond(_ref4, v, h) {
  var x = _ref4.x,
    y = _ref4.y,
    width = _ref4.width,
    height = _ref4.height,
    index = _ref4.index;
  return {
    index: index,
    x: x,
    y: y,
    v: v,
    h: h,
    wii: Math.max(height, width) / 2 * Math.SQRT2
  };
}

export { diamondGraphRotation };
