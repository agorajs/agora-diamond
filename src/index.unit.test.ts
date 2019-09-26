import { diamondGraphRotation } from '.';
const graph = {
  nodes: [
    {
      index: 0,
      x: 15,
      y: 10,
      label: '0',
      width: 10,
      height: 10
    },
    {
      index: 1,
      x: 10,
      y: 20,
      label: '0',
      width: 10,
      height: 10
    },
    {
      index: 3,
      x: 20,
      y: 20,
      label: '0',
      width: 10,
      height: 10
    }
  ],
  edges: []
};

test('Agora Diamond', () => {
  diamondGraphRotation(graph);
});
