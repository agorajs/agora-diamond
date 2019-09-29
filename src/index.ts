import { Function, Node, toPolar, toCartesian, round } from 'agora-graph';
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
  const vs = _.sortBy(rotatedNodes, ({ x }) => x);
  const hs = _.sortBy(rotatedNodes, ({ y }) => y);
  const diamonds = _.map(rotatedNodes, n => {
    return node2Diamond(
      n,
      _.findIndex(vs, ['index', n.index])!,
      _.findIndex(hs, ['index', n.index])!
    );
  });

  const constraints: string[] = [];

  const minimize = _(diamonds)
    .map(({ index, x, y }) => `x${index} - ${x} + y${index} - ${y}`)
    .join(' + ');

  constraints.push('min: ' + minimize + ';');

  diamonds.sort((a, b) => a.index - b.index);

  for (let i = 0; i < diamonds.length; i++) {
    const { index, v, h } = diamonds[i];
    if (v < vs.length - 1) {
      constraints.push(`x${index} - x${vs[v + 1].index} <= 0;`);
    }
    // x'_v(i) <= y'_v(i+1)
    if (h < hs.length - 1) {
      constraints.push(`y${index} - y${hs[h + 1].index} <= 0;`);
    }
  }

  //
  // for (let i = 0; i < diamonds.length; i++) {
  //   const { index: iIdx, y: yi } = diamonds[i];
  //   let ystar = -1;
  //   for (let j = i - 1; j > 0; j--) {
  //     const { index: jIdx, y: yj } = diamonds[j];

  //     if (ystar < yj && yj <= yi) {
  //       constraints.push(`y${jIdx} - y${iIdx} <= 0;`);
  //       ystar = yj;
  //     }
  //   }
  // }

  // forall 1<=i<=j<=n xi <= xj and yi <= yj
  //    x'j - x'i + y'j - y'i >= wi +wj
  // console.log(diamonds);

  for (let i = 0; i < diamonds.length; i++) {
    const { index: iIdx, x: xi, y: yi, width: wi } = diamonds[i];
    for (let j = i + 1; j < diamonds.length; j++) {
      const { index: jIdx, x: xj, y: yj, width: wj } = diamonds[j];
      if (xi <= xj && yi <= yj) {
        constraints.push(
          `x${jIdx} - x${iIdx} + y${jIdx} - y${iIdx} >= ${(wi + wj) *
            Math.SQRT2};`
        );
      }
      if (xi >= xj && yi <= yj) {
        constraints.push(
          `x${iIdx} - x${jIdx} + y${jIdx} - y${iIdx} >= ${(wi + wj) *
            Math.SQRT2};`
        );
      }
      if (xi >= xj && yi >= yj) {
        constraints.push(
          `x${iIdx} - x${jIdx} + y${iIdx} - y${jIdx} >= ${(wi + wj) *
            Math.SQRT2};`
        );
      }
      if (xi <= xj && yi >= yj) {
        constraints.push(
          `x${jIdx} - x${iIdx} + y${iIdx} - y${jIdx} >= ${(wi + wj) *
            Math.SQRT2};`
        );
      }
    }
  }

  for (let index = 0; index < diamonds.length; index++) {
    const { index: i, x, y } = diamonds[index];
    constraints.push(`x${i} >= ${x};`);
    constraints.push(`y${i} >= ${y};`);
  }

  console.log(constraints.join('\n'));

  const tmodel = ReformatLP(constraints.join('\n'));

  // console.log(tmodel);
  const solver = Solve(tmodel);
  const { feasible, result, bounded, ...rest } = solver;
  const positions: { [k: string]: any } = _.transform(
    rest,
    function(result: any, val: number, key: string) {
      const tpe = key.substr(0, 1);
      const index = key.substr(1);
      (result[index] || (result[index] = {}))[tpe] = val;
    },
    {}
  );

  console.log(JSON.stringify(graph));
  console.log(JSON.stringify(diamonds));
  console.log(
    JSON.stringify(
      diamonds.map(({ width, height, ...d }) => {
        const update: any = {};
        if (positions[d.index]) {
          if (positions[d.index].x) update.x = positions[d.index].x;
          if (positions[d.index].y) update.y = positions[d.index].y;
        }
        return { ...d, ...update, width: width * 2, height: height * 2 };
      })
    )
  );
  return { graph };
};

type Diamond = {
  [k: string]: any;
  index: number;
  x: number;
  y: number;
  h: number;
  v: number;
  width: number;
  height: number;
};

function node2Diamond(
  { x, y, width, height, index }: Node,
  v: number,
  h: number
): Diamond {
  return {
    up: { kind: 'diamond' },
    index,
    x,
    y,
    v,
    h,
    width: Math.max(height, width) / 2,
    height: Math.max(height, width) / 2
  };
}

function diamond2Node(n: Node, { x, y }: Diamond): Node {
  return { ...n, x, y };
}
