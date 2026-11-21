// Game — the state machine of LUMEN & LARK: menu, playing, level clear,
// time-up, victory. It owns the timer, the clicks, the combo, the hints and
// the score, and it redraws both panels every frame so markers, hint pulses
// and floating score pops animate.
(function (global) {
  'use strict';

  var SCENE_W = 560;
  var SCENE_H = 420;
  var SCALE = 2; // canvas backing store is 2x the scene space, for crisp lines
  var MISS_PENALTY_SECONDS = 3;
  var HINT_COOLDOWN_SECONDS = 8;
  var HINT_PULSE_SECONDS = 2;

  function Game(leftCanvas, rightCanvas, ui, sounds) {
    this.left = leftCanvas;
    this.right = rightCanvas;
    this.ui = ui;
    this.sounds = sounds;
    this.state = 'menu';
    this.levelIndex = 0;
    this.level = null;
    this.found = new Set();
    this.hintId = null;
    this.hintUntil = 0;
    this.hintUses = 0;
    this.hintCooldownUntil = 0;
    this.timeLeft = 0;
    this.score = 0;
    this.levelScore = 0;
    this.combo = 0;
    this.wrong = 0;
    this.pops = [];
    this.shakePanel = null;
    this.shakeUntil = 0;
    this.lastTickSecond = -1;
    this.lastFrame = 0;
    this.demo = null;
    this.best = 0;
    try {
      this.best = Number(window.localStorage.getItem('lumen-lark-best') || 0) || 0;
    } catch (e) {
      this.best = 0;
    }
    this._bindClicks();
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  Game.prototype._bindClicks = function () {
    var self = this;
    function handler(panel) {
      return function (event) {
        self.sounds.unlock();
        if (self.state !== 'playing') return;
        var rect = event.currentTarget.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width) * SCENE_W;
        var y = ((event.clientY - rect.top) / rect.height) * SCENE_H;
        self.clickAt(panel, x, y);
      };
    }
    this.left.addEventListener('click', handler('left'));
    this.right.addEventListener('click', handler('right'));
  };

  Game.prototype.levels = function () {
    return global.Levels;
  };

  Game.prototype.startLevel = function (index, demo) {
    var levels = this.levels();
    this.levelIndex = index;
    this.level = levels[index];
    this.state = 'playing';
    this.found = new Set();
    this.hintId = null;
    this.hintUses = this.level.hintUses;
    this.hintCooldownUntil = 0;
    this.timeLeft = this.level.timeLimit;
    this.levelScore = 0;
    this.combo = 0;
    this.wrong = 0;
    this.pops = [];
    this.lastTickSecond = -1;
    this.demo = demo || null;
    if (demo) {
      if (demo.timeLeft != null) this.timeLeft = demo.timeLeft;
      if (demo.foundIds) {
        // A demo state is a genuine mid-hunt state: score the preset finds
        // exactly as real clicks would, so the counter and the score agree.
        for (var i = 0; i < demo.foundIds.length; i++) {
          this.found.add(demo.foundIds[i]);
          var gained = 100 + 25 * this.combo;
          this.combo += 1;
          this.score += gained;
          this.levelScore += gained;
        }
      }
      if (demo.hintId) {
        this.hintId = demo.hintId;
        this.hintUntil = Infinity; // the demo hint never fades
      }
    }
    this.ui.showGame(this.level);
    this.ui.updateHud(this.hud());
    if (demo && demo.announce) this.ui.toast(demo.announce);
    else this.ui.toast(this.level.name + ' — find ' + this.level.differences.length + ' differences');
  };

  Game.prototype.toMenu = function () {
    this.state = 'menu';
    this.ui.showMenu(this.best);
  };

  Game.prototype.hud = function () {
    return {
      found: this.found.size,
      total: this.level ? this.level.differences.length : 0,
      timeLeft: Math.max(0, Math.ceil(this.timeLeft)),
      timeLimit: this.level ? this.level.timeLimit : 1,
      score: this.score,
      combo: this.combo,
      hintsLeft: this.hintUses,
      hintReady: performance.now() >= this.hintCooldownUntil,
      levelName: this.level ? this.level.name : '',
      levelIndex: this.levelIndex,
    };
  };

  Game.prototype.clickAt = function (panel, x, y) {
    if (this.state !== 'playing' || !this.level) return null;
    var diffs = this.level.differences;
    for (var i = 0; i < diffs.length; i++) {
      var d = diffs[i];
      if (this.found.has(d.id)) continue;
      var dx = x - d.x;
      var dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        return this._found(d, x, y);
      }
    }
    return this._miss(panel);
  };

  Game.prototype._found = function (d, x, y) {
    this.found.add(d.id);
    var gained = 100 + 25 * this.combo;
    this.combo += 1;
    this.score += gained;
    this.levelScore += gained;
    this.pops.push({ x: d.x, y: d.y - 14, text: '+' + gained, born: performance.now() });
    this.sounds.find();
    this.ui.toast('Found: ' + d.label + '  (+' + gained + ')');
    this.ui.updateHud(this.hud());
    if (this.found.size === this.level.differences.length) this._levelClear();
    return { hit: true, id: d.id, gained: gained };
  };

  Game.prototype._miss = function (panel) {
    this.combo = 0;
    this.wrong += 1;
    this.timeLeft = Math.max(0, this.timeLeft - MISS_PENALTY_SECONDS);
    this.shakePanel = panel;
    this.shakeUntil = performance.now() + 250;
    this.sounds.miss();
    this.ui.toast('Not a difference — 3 seconds lost');
    this.ui.updateHud(this.hud());
    return { hit: false };
  };

  Game.prototype.useHint = function () {
    if (this.state !== 'playing' || !this.level) return false;
    if (this.hintUses <= 0) {
      this.ui.toast('No hints left on this level');
      return false;
    }
    var now = performance.now();
    if (now < this.hintCooldownUntil) {
      this.ui.toast('Hint is recharging…');
      return false;
    }
    var remaining = [];
    var diffs = this.level.differences;
    for (var i = 0; i < diffs.length; i++) {
      if (!this.found.has(diffs[i].id)) remaining.push(diffs[i]);
    }
    if (remaining.length === 0) return false;
    var pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintId = pick.id;
    this.hintUntil = now + HINT_PULSE_SECONDS * 1000;
    this.hintUses -= 1;
    this.hintCooldownUntil = now + HINT_COOLDOWN_SECONDS * 1000;
    this.sounds.hint();
    this.ui.toast('Hint: look near ' + pick.label);
    this.ui.updateHud(this.hud());
    return true;
  };

  Game.prototype.restartLevel = function () {
    if (this.level) {
      this.score -= this.levelScore;
      this.startLevel(this.levelIndex, this.demo);
    }
  };

  Game.prototype._levelClear = function () {
    var accuracy = this.found.size / Math.max(1, this.found.size + this.wrong);
    var timeFrac = this.timeLeft / this.level.timeLimit;
    var stars = 1;
    if (timeFrac >= 0.5 && accuracy >= 0.9) stars = 3;
    else if (timeFrac >= 0.25 || accuracy >= 0.8) stars = 2;
    var timeBonus = Math.round(this.timeLeft) * 5;
    this.score += timeBonus;
    this.levelScore += timeBonus;
    this.sounds.fanfare();
    if (this.score > this.best) {
      this.best = this.score;
      try {
        window.localStorage.setItem('lumen-lark-best', String(this.best));
      } catch (e) {
        /* best score is a nicety, never a failure */
      }
    }
    var last = this.levelIndex >= this.levels().length - 1;
    this.state = last ? 'victory' : 'clear';
    this.ui.showClear({
      stars: stars,
      timeBonus: timeBonus,
      levelScore: this.levelScore,
      totalScore: this.score,
      accuracy: Math.round(accuracy * 100),
      last: last,
      levelName: this.level.name,
    });
  };

  Game.prototype._timeUp = function () {
    this.state = 'over';
    this.sounds.miss();
    this.ui.showTimeUp({
      found: this.found.size,
      total: this.level.differences.length,
      levelName: this.level.name,
    });
  };

  Game.prototype._loop = function (now) {
    requestAnimationFrame(this._loop);
    var dt = this.lastFrame ? (now - this.lastFrame) / 1000 : 0;
    this.lastFrame = now;
    if (this.state === 'playing') {
      if (!this.demo || !this.demo.freezeTimer) {
        this.timeLeft -= dt;
        var sec = Math.ceil(this.timeLeft);
        if (this.timeLeft <= 10 && sec !== this.lastTickSecond && this.timeLeft > 0) {
          this.lastTickSecond = sec;
          this.sounds.tick();
        }
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          this.ui.updateHud(this.hud());
          this._timeUp();
        }
      }
      if (this.hintId && now > this.hintUntil && this.hintUntil !== Infinity) {
        this.hintId = null;
      }
      this.ui.updateHud(this.hud());
    }
    this._render(now);
  };

  Game.prototype._drawMarkers = function (ctx, now) {
    var diffs = this.level ? this.level.differences : [];
    for (var i = 0; i < diffs.length; i++) {
      var d = diffs[i];
      if (!this.found.has(d.id)) continue;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
      ctx.fill();
      // A small check mark inside the ring.
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(d.x - 8, d.y);
      ctx.lineTo(d.x - 2, d.y + 6);
      ctx.lineTo(d.x + 9, d.y - 6);
      ctx.stroke();
    }
    // Hint pulse: an expanding ring over one unfound difference.
    if (this.hintId && this.level) {
      var target = null;
      for (var j = 0; j < diffs.length; j++) {
        if (diffs[j].id === this.hintId) target = diffs[j];
      }
      if (target) {
        var phase = (now % 900) / 900;
        var radius = target.r + 6 + phase * 14;
        ctx.strokeStyle = 'rgba(255, 215, 0, ' + (0.9 - phase * 0.6).toFixed(2) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Floating score pops.
    this.pops = this.pops.filter(function (p) {
      return now - p.born < 900;
    });
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    for (var k = 0; k < this.pops.length; k++) {
      var p = this.pops[k];
      var age = (now - p.born) / 900;
      ctx.fillStyle = 'rgba(255, 215, 0, ' + (1 - age).toFixed(2) + ')';
      ctx.fillText(p.text, p.x, p.y - age * 26);
    }
  };

  Game.prototype._render = function (now) {
    if (!this.level) return;
    var all = new Set();
    var diffs = this.level.differences;
    for (var i = 0; i < diffs.length; i++) all.add(diffs[i].id);
    var empty = new Set();
    this._paintPanel(this.left, empty, now, 'left');
    this._paintPanel(this.right, all, now, 'right');
  };

  Game.prototype._paintPanel = function (canvas, applied, now, panel) {
    var ctx = canvas.getContext('2d');
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, SCENE_W, SCENE_H);
    if (this.shakePanel === panel && now < this.shakeUntil) {
      var ox = (Math.random() - 0.5) * 8;
      var oy = (Math.random() - 0.5) * 8;
      ctx.translate(ox, oy);
    }
    global.Scenes.paintScene(ctx, this.level.scene, applied);
    this._drawMarkers(ctx, now);
  };

  global.Game = Game;
})(window);
