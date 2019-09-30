import { Function, Node, toPolar, toCartesian } from 'agora-graph';
import _ from 'lodash';
import { Solve, ReformatLP } from 'javascript-lp-solver';

export type Props = {
  padding: number;
};

export const diamondRotation: Function<Props> = function(
  graph,
  options = { padding: 0 }
) {
  const diamonds = _.map(graph.nodes, node2Diamond);
  return { graph };
};

export const diamondGraphRotation: Function<Props> = function(
  graph,
  options = { padding: 0 }
) {
  graph.nodes.sort((a, b) => a.index - b.index);

  const rotatedNodes = _.map(graph.nodes, n => {
    const polar = toPolar(n);
    polar.theta += Math.PI / 4;
    const cart = toCartesian(polar);

    return { ...n, ...cart };
  });

  const vs = _.sortBy(rotatedNodes, 'x');
  const hs = _.sortBy(rotatedNodes, 'y');

  const diamonds = _.map(rotatedNodes, n => {
    return node2Diamond(
      n,
      _.findIndex(vs, ['index', n.index])!, // i'm sure it exists
      _.findIndex(hs, ['index', n.index])! // i'm sure it exists
    );
  });

  const constraints: string[] = [];

  // set minimize constraint
  const minimize = _(diamonds)
    .map(({ index, x, y }) => `x${index} - ${x} + y${index} - ${y}`)
    .join(' + ');

  constraints.push('min: ' + minimize + ';');

  // sort by index
  diamonds.sort((a, b) => a.index - b.index);

  // setting up orthogonal constraints
  for (let i = 0; i < diamonds.length; i++) {
    const { index, v, h } = diamonds[i];
    if (v + 1 < vs.length) {
      // is not last
      // x'_v(i) <= x'_v(i+1)
      constraints.push(`x${index} - x${vs[v + 1].index} <= 0;`);
    }
    if (h + 1 < hs.length) {
      // is not last
      // y'_h(i) <= y'_h(i+1)
      constraints.push(`y${index} - y${hs[h + 1].index} <= 0;`);
    }
  }

  // sort by x
  diamonds.sort((a, b) => a.x - b.x);

  for (let iIdx = 0; iIdx < diamonds.length; iIdx++) {
    const { index: i, y: yi, wii: wi } = diamonds[iIdx];

    let ymax = null;
    let ymin = null;
    for (let jIdx = iIdx + 1; jIdx < diamonds.length; jIdx++) {
      const { index: j, y: yj, wii: wj } = diamonds[jIdx];

      // xj >= xi
      if (yi <= yj && (ymax === null || yj <= ymax)) {
        //wi is not width
        constraints.push(`x${j} - x${i} + y${j} - y${i} >= ${wi + wj};`);
        ymax = yj;
      }

      if (yi >= yj && (ymin === null || yj >= ymin)) {
        constraints.push(`x${j} - x${i} - y${j} + y${i} >= ${wi + wj};`);
        ymin = yj;
      }
    }
  }

  // minimal position constraint
  for (let index = 0; index < diamonds.length; index++) {
    const { index: i, x, y } = diamonds[index];
    constraints.push(`x${i} >= ${x};`);
    constraints.push(`y${i} >= ${y};`);
  }

  // transform to js constraint
  const lpsolve = constraints.join('\n');

  const tmodel = ReformatLP(lpsolve);

  // console.log(lpsolve);
  const solver = Solve(tmodel);

  const { feasible, result, bounded, ...rest } = solver;
  // index => {x?: y:?}
  const positions: { [k: string]: any } = _.transform(
    rest,
    function(result: any, val: number, key: string) {
      const tpe = key.substr(0, 1);
      const index = key.substr(1);
      (result[index] || (result[index] = {}))[tpe] = val;
    },
    {}
  );

  // rotate back to cartesian
  const rotatedPos: { [k: string]: { x: number; y: number } } = {};
  _.forEach(diamonds, ({ index, x, y }) => {
    const position: { x: number; y: number } = {
      x: positions[index] && positions[index].x ? positions[index].x : x,
      y: positions[index] && positions[index].y ? positions[index].y : y
    };
    const polar = toPolar(position);
    polar.theta -= Math.PI / 4;
    rotatedPos[index] = toCartesian(polar);
  });

  // map to nodes
  const updatedNodes = _.map(graph.nodes, ({ index, x, y, ...rest }) => ({
    index,
    ...rest,
    ...rotatedPos[index]
  }));

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

type Diamond = {
  [k: string]: any;
  index: number;
  x: number;
  y: number;
  h: number;
  v: number;
  wii: number;
};

function node2Diamond(
  { x, y, width, height, index }: Node,
  v: number,
  h: number
): Diamond {
  return {
    index,
    x,
    y,
    v,
    h,
    wii: (Math.max(height, width) / 2) * Math.SQRT2
  };
}
