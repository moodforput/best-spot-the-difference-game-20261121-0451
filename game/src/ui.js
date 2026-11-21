// UI — everything drawn in the DOM around the two canvases: the HUD (counter,
// timer bar, score, hints), the toasts, and the menu / level-clear / time-up
// screens. The canvases themselves are painted by game.js; this file only
// touches the page around them.
(function (global) {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  function UI(handlers) {
    this.handlers = handlers || {};
    this.lastHud = '';
    this.toastTimer = null;
    this._wire();
  }

  UI.prototype._wire = function () {
    var h = this.handlers;
    function on(id, fn) {
      var el = $(id);
      if (el && fn) el.addEventListener('click', fn);
    }
    on('hint-btn', h.onHint);
    on('mute-btn', h.onMute);
    on('menu-btn', h.onMenu);
    on('clear-next', h.onNext);
    on('clear-replay', h.onReplay);
    on('clear-menu', h.onMenu);
    on('over-retry', h.onRetry);
    on('over-menu', h.onMenu);
    var cards = document.querySelectorAll('[data-level]');
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        card.addEventListener('click', function () {
          if (h.onLevelSelect) h.onLevelSelect(Number(card.getAttribute('data-level')));
        });
      })(cards[i]);
    }
  };

  UI.prototype._show = function (id) {
    var screens = ['screen-menu', 'screen-game', 'screen-clear', 'screen-over'];
    for (var i = 0; i < screens.length; i++) {
      var el = $(screens[i]);
      if (el) el.classList.toggle('hidden', screens[i] !== id);
    }
  };

  UI.prototype.showMenu = function (best) {
    this._show('screen-menu');
    var bestEl = $('best-score');
    if (bestEl) bestEl.textContent = best > 0 ? 'Best score: ' + best : 'No hunts finished yet — good luck, detective.';
  };

  UI.prototype.showGame = function (level) {
    this._show('screen-game');
    var name = $('hud-level');
    if (name) name.textContent = 'Level ' + level.id + ' — ' + level.name;
    var sub = $('hud-subtitle');
    if (sub) sub.textContent = level.subtitle;
  };

  // Updates the HUD, but only touches the DOM when a value actually changed,
  // so the frame loop costs nothing when the game is idle.
  UI.prototype.updateHud = function (hud) {
    var key = [
      hud.found, hud.total, hud.timeLeft, hud.score, hud.combo,
      hud.hintsLeft, hud.hintReady, hud.levelIndex,
    ].join('|');
    if (key === this.lastHud) return;
    this.lastHud = key;
    var set = function (id, text) {
      var el = $(id);
      if (el) el.textContent = text;
    };
    set('hud-found', 'Found ' + hud.found + ' / ' + hud.total);
    set('hud-time', hud.timeLeft + 's');
    set('hud-score', 'Score ' + hud.score);
    set('hud-combo', hud.combo >= 2 ? 'Combo x' + hud.combo : '');
    var bar = $('hud-timebar-fill');
    if (bar) {
      var frac = hud.timeLeft / Math.max(1, hud.timeLimit);
      bar.style.width = Math.max(0, Math.min(100, frac * 100)).toFixed(1) + '%';
      bar.classList.toggle('low', frac <= 0.2);
    }
    var hintBtn = $('hint-btn');
    if (hintBtn) {
      hintBtn.textContent = 'Hint (' + hud.hintsLeft + ')';
      hintBtn.disabled = hud.hintsLeft <= 0 || !hud.hintReady;
    }
  };

  UI.prototype.toast = function (text) {
    var el = $('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    if (this.toastTimer) clearTimeout(this.toastTimer);
    var self = this;
    this.toastTimer = setTimeout(function () {
      el.classList.remove('show');
    }, 2200);
  };

  UI.prototype.setMuted = function (muted) {
    var btn = $('mute-btn');
    if (btn) btn.textContent = muted ? 'Sound: off' : 'Sound: on';
  };

  UI.prototype.showClear = function (result) {
    this._show('screen-clear');
    var title = $('clear-title');
    if (title) {
      title.textContent = result.last
        ? 'You found them all — the attic keeps no more secrets!'
        : result.levelName + ' — cleared!';
    }
    var stars = $('clear-stars');
    if (stars) stars.textContent = '★'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
    var stats = $('clear-stats');
    if (stats) {
      stats.textContent =
        'Time bonus +' + result.timeBonus +
        '  ·  Level score ' + result.levelScore +
        '  ·  Accuracy ' + result.accuracy + '%' +
        '  ·  Total ' + result.totalScore;
    }
    var next = $('clear-next');
    if (next) next.textContent = result.last ? 'Play again' : 'Next level →';
  };

  UI.prototype.showTimeUp = function (result) {
    this._show('screen-over');
    var stats = $('over-stats');
    if (stats) {
      stats.textContent =
        'Time ran out on ' + result.levelName +
        ' — you found ' + result.found + ' of ' + result.total + ' differences.';
    }
  };

  global.UI = UI;
})(window);
