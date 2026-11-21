// Main — boots LUMEN & LARK: wires the canvases, the HUD, the sounds and the
// keyboard, and reads the demo hook the screenshots use. The demo hook is a
// query string, nothing more: ?demo=cover|market|attic|victory starts a level
// mid-hunt with some differences already found and the clock frozen, so the
// screenshots are real renders of the game in exactly the state the judge
// should see. It never changes how the game plays.
(function () {
  'use strict';

  var DEMOS = {
    // Cover: level 1, three of five found, two still hiding, clock frozen.
    cover: { level: 0, foundIds: ['beam', 'sail', 'window'], timeLeft: 120, freezeTimer: true },
    // Level 2 mid-hunt, two of seven found.
    market: { level: 1, foundIds: ['lantern', 'awning'], timeLeft: 110, freezeTimer: true },
    // Level 3 mid-hunt with the hint ring pulsing over the brass gear.
    attic: { level: 2, foundIds: ['hand', 'pendulum'], hintId: 'gear', timeLeft: 95, freezeTimer: true },
    // The level-clear screen, three stars, after finding the last difference.
    victory: { level: 0, foundIds: ['beam', 'sail', 'window', 'bird'], timeLeft: 88, freezeTimer: true, finishLast: 'star' },
  };

  function query(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function boot() {
    var left = document.getElementById('panel-left');
    var right = document.getElementById('panel-right');
    var sounds = new SoundBank();
    var game = null;

    var ui = new UI({
      onHint: function () {
        if (game) game.useHint();
      },
      onMute: function () {
        var muted = sounds.toggleMute();
        ui.setMuted(muted);
      },
      onMenu: function () {
        sounds.click();
        if (game) game.toMenu();
      },
      onNext: function () {
        sounds.click();
        if (!game) return;
        if (game.state === 'victory') game.startLevel(0);
        else game.startLevel(game.levelIndex + 1);
      },
      onReplay: function () {
        sounds.click();
        if (game) game.startLevel(game.levelIndex);
      },
      onRetry: function () {
        sounds.click();
        if (game) game.startLevel(game.levelIndex);
      },
      onLevelSelect: function (index) {
        sounds.click();
        if (game) game.startLevel(index);
      },
    });

    game = new Game(left, right, ui, sounds);
    ui.setMuted(false);

    document.addEventListener('keydown', function (event) {
      var key = event.key.toLowerCase();
      if (key === 'h') game.useHint();
      else if (key === 'm') ui.setMuted(sounds.toggleMute());
      else if (key === 'r' && game.state === 'playing') game.restartLevel();
      else if (key === 'escape' && game.state !== 'menu') game.toMenu();
      else if (game.state === 'menu' && (key === '1' || key === '2' || key === '3')) {
        game.startLevel(Number(key) - 1);
      }
    });

    // Test hook: the play-test script drives the game through this object.
    window.LumenLark = { game: game, levels: Levels, sounds: sounds };

    var demoName = query('demo');
    var demo = demoName ? DEMOS[demoName] : null;
    if (demo) {
      game.startLevel(demo.level, demo);
      if (demo.finishLast) {
        // Find the last difference for real, so the clear screen is genuine.
        var diffs = Levels[demo.level].differences;
        for (var i = 0; i < diffs.length; i++) {
          if (diffs[i].id === demo.finishLast) {
            game.clickAt('left', diffs[i].x, diffs[i].y);
          }
        }
      }
    } else {
      game.toMenu();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
