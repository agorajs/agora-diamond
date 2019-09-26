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
  const vs = _.sortBy(graph.nodes, ({ x }) => x);
  const hs = _.sortBy(graph.nodes, ({ y }) => y);
  const diamonds = _.map(graph.nodes, n => {
    const polar = toPolar(n);
    polar.theta += Math.PI / 4;
    const cart = toCartesian(polar);
    return node2Diamond(
      { ...n, ...cart },
      _.findIndex(vs, ['index', n.index])!,
      _.findIndex(hs, ['index', n.index])!
    );
  });

  console.log(diamonds);
  console.log(hs);

  const constraints: { [k: string]: any } = {};
  const temp = _.map(diamonds, n => {
    // y'_v(i) <= y'_v(i+1)
    const building: { [k: string]: any } = {};
    if (n.v < vs.length - 1) {
      const yConstraint = `y'_${n.index} <= y'_${vs[n.v + 1].index}`;
      building[yConstraint] = 1;
      constraints[yConstraint] = 1;
    }
    // x'_v(i) <= y'_v(i+1)
    if (n.h < hs.length - 1) {
      const xConstraint = `x'_${n.index} <= x'_${hs[n.h + 1].index}`;
      building[xConstraint] = 1;
      constraints[xConstraint] = { equal: 1 };
    }

    return building;
  });

  const tmodel = ReformatLP(`min: x1 + x2;/*comment*/
x1 >= 1;
x2 >= 1;
x1 + x2 >= 2;
int x1;`);

  console.log(tmodel);

  const model = {
    optimize: {},
    constraints: {},
    variables: { ...diamonds }
  };

  console.log(model);

  //   const solver = Solve();

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
    index,
    x,
    y,
    v,
    h,
    width: Math.max(height, width),
    height: Math.max(height, width)
  };
}

function diamond2Node(n: Node, { x, y }: Diamond): Node {
  return { ...n, x, y };
}
