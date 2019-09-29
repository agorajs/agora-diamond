import { diamondGraphRotation } from '.';
const graph = {
  edges: [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 0, target: 3 },
    { source: 0, target: 4 },
    { source: 0, target: 5 },
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 4 },
    { source: 1, target: 5 },
    { source: 2, target: 3 },
    { source: 2, target: 4 },
    { source: 2, target: 5 },
    { source: 3, target: 4 },
    { source: 3, target: 5 },
    { source: 4, target: 5 },
    { source: 2, target: 6 },
    { source: 1, target: 6 },
    { source: 5, target: 6 },
    { source: 3, target: 6 },
    { source: 4, target: 6 },
    { source: 2, target: 7 },
    { source: 3, target: 7 },
    { source: 4, target: 7 },
    { source: 6, target: 7 },
    { source: 1, target: 7 },
    { source: 4, target: 8 },
    { source: 3, target: 8 },
    { source: 1, target: 8 },
    { source: 5, target: 8 },
    { source: 7, target: 8 },
    { source: 5, target: 9 },
    { source: 4, target: 9 },
    { source: 3, target: 9 },
    { source: 6, target: 9 },
    { source: 1, target: 9 }
  ],
  nodes: [
    { index: 0, label: 'undefined', x: 87, y: 44, width: 20, height: 10 },
    { index: 1, label: 'undefined', x: 57, y: 43, width: 20, height: 10 },
    { index: 2, label: 'undefined', x: 67, y: 72, width: 20, height: 10 },
    { index: 3, label: 'undefined', x: 46, y: 58, width: 20, height: 10 },
    { index: 4, label: 'undefined', x: 47, y: 46, width: 20, height: 10 },
    { index: 5, label: 'undefined', x: 61, y: 29, width: 20, height: 10 },
    { index: 6, label: 'undefined', x: 25, y: 57, width: 20, height: 10 },
    { index: 7, label: 'undefined', x: 45, y: 85, width: 20, height: 10 },
    { index: 8, label: 'undefined', x: 80, y: 67, width: 20, height: 10 },
    { index: 9, label: 'undefined', x: 25, y: 25, width: 20, height: 10 }
  ]
};

test('Agora Diamond', () => {
  diamondGraphRotation(graph);
});
