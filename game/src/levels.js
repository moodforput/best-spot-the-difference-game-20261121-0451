// Levels — three hunts of rising difficulty. Each difference names the painter
// toggle it flips and the spot on the scene (560 x 420) where a click counts,
// with a fair hit radius. Positions match the painters in scenes.js exactly.
(function (global) {
  'use strict';

  var LEVELS = [
    {
      id: 1,
      name: 'Harbor Dusk',
      scene: 'harbor',
      subtitle: 'Five changes hide along the evening shore. Find them all.',
      timeLimit: 150,
      hintUses: 3,
      differences: [
        { id: 'beam', label: 'the lighthouse beam', x: 225, y: 150, r: 28 },
        { id: 'sail', label: 'the sailboat’s sail', x: 312, y: 312, r: 22 },
        { id: 'window', label: 'the lit window', x: 477, y: 290, r: 16 },
        { id: 'bird', label: 'the bird in the sky', x: 210, y: 60, r: 16 },
        { id: 'star', label: 'the bright star', x: 60, y: 40, r: 14 },
      ],
    },
    {
      id: 2,
      name: 'The Night Market',
      scene: 'market',
      subtitle: 'Seven changes hide among the lanterns and stalls. Look closely.',
      timeLimit: 150,
      hintUses: 3,
      differences: [
        { id: 'lantern', label: 'the paper lantern', x: 430, y: 110, r: 20 },
        { id: 'awning', label: 'the striped awning', x: 275, y: 218, r: 22 },
        { id: 'cat', label: 'the market cat', x: 330, y: 365, r: 18 },
        { id: 'crates', label: 'the crate stack', x: 78, y: 341, r: 18 },
        { id: 'bulb', label: 'the string-light bulb', x: 280, y: 70, r: 12 },
        { id: 'sign', label: 'the stall sign', x: 275, y: 193, r: 16 },
        { id: 'moon', label: 'the moon', x: 480, y: 60, r: 22 },
      ],
    },
    {
      id: 3,
      name: 'Clockmaker’s Attic',
      scene: 'attic',
      subtitle: 'Ten small changes hide in the clockmaker’s room. No mercy.',
      timeLimit: 120,
      hintUses: 3,
      differences: [
        { id: 'hand', label: 'the clock’s minute hand', x: 188, y: 120, r: 26 },
        { id: 'pendulum', label: 'the swinging pendulum', x: 150, y: 232, r: 18 },
        { id: 'gear', label: 'the brass gear', x: 190, y: 292, r: 22 },
        { id: 'book', label: 'the book on the shelf', x: 364, y: 162, r: 14 },
        { id: 'jar', label: 'the jar on the shelf', x: 506, y: 224, r: 14 },
        { id: 'tool', label: 'the hammer on the bench', x: 113, y: 325, r: 16 },
        { id: 'lamp', label: 'the hanging lamp', x: 300, y: 60, r: 20 },
        { id: 'moon', label: 'the moon in the window', x: 478, y: 80, r: 20 },
        { id: 'rug', label: 'the rug’s motif', x: 300, y: 380, r: 18 },
        { id: 'tail', label: 'the sleeping cat’s tail', x: 408, y: 384, r: 16 },
      ],
    },
  ];

  global.Levels = LEVELS;
})(window);
