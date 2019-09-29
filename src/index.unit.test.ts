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
    { index: 0, label: '0', x: 87, y: 44, width: 20, height: 10 },
    { index: 1, label: '1', x: 57, y: 43, width: 20, height: 10 },
    { index: 2, label: '2', x: 67, y: 72, width: 20, height: 10 },
    { index: 3, label: '3', x: 46, y: 58, width: 20, height: 10 },
    { index: 4, label: '4', x: 47, y: 46, width: 20, height: 10 },
    { index: 5, label: '5', x: 61, y: 29, width: 20, height: 10 },
    { index: 6, label: '6', x: 25, y: 57, width: 20, height: 10 },
    { index: 7, label: '7', x: 45, y: 85, width: 20, height: 10 },
    { index: 8, label: '8', x: 80, y: 67, width: 20, height: 10 },
    { index: 9, label: '9', x: 25, y: 25, width: 20, height: 10 }
  ]
};

test('Agora Diamond', () => {
  const res = diamondGraphRotation(graph);

  expect(res.graph).toEqual({
    nodes: [
      {
        index: 0,
        label: '0',
        width: 20,
        height: 10,
        x: 105.00000000058336,
        y: 38.99999999819637
      },
      {
        index: 1,
        label: '1',
        width: 20,
        height: 10,
        x: 80.99999999842973,
        y: 31.99999999580046
      },
      {
        index: 2,
        label: '2',
        width: 20,
        height: 10,
        x: 92.0000000011846,
        y: 83.00000000214473
      },
      {
        index: 3,
        label: '3',
        width: 20,
        height: 10,
        x: 60.99999999663503,
        y: 51.99999999759518
      },
      {
        index: 4,
        label: '4',
        width: 20,
        height: 10,
        x: 60.99999999663503,
        y: 32.00000000287154
      },
      {
        index: 5,
        label: '5',
        width: 20,
        height: 10,
        x: 78.00000000346382,
        y: 12.00000000107682
      },
      {
        index: 6,
        label: '6',
        width: 20,
        height: 10,
        x: 25.00000000191138,
        y: 57.0000000019114
      },
      {
        index: 7,
        label: '7',
        width: 20,
        height: 10,
        x: 51.99999999938988,
        y: 91.99999999938989
      },
      {
        index: 8,
        label: '8',
        width: 20,
        height: 10,
        x: 112.0000000029793,
        y: 63.00000000035005
      },
      {
        index: 9,
        label: '9',
        width: 20,
        height: 10,
        x: 29.49999999999554,
        y: 20.50000000095569
      }
    ],
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
    ]
  });
});
