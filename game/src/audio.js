// SoundBank — every sound in LUMEN & LARK is synthesized with WebAudio.
// No audio files, no network: a few oscillators and envelopes make the chime,
// the thud, the low-time tick and the level-clear fanfare.
(function (global) {
  'use strict';

  function SoundBank() {
    this.muted = false;
    this.ctx = null;
  }

  SoundBank.prototype._context = function () {
    if (this.ctx) return this.ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
    }
    return this.ctx;
  };

  // Wake the context from a user gesture; browsers keep it suspended until then.
  SoundBank.prototype.unlock = function () {
    var ctx = this._context();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  };

  SoundBank.prototype._tone = function (freq, startAt, dur, type, vol) {
    var ctx = this._context();
    if (!ctx || this.muted) return;
    try {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var t0 = ctx.currentTime + startAt;
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch (e) {
      /* sound is decoration; a failure never breaks the game */
    }
  };

  // A bright two-note chime when a difference is found.
  SoundBank.prototype.find = function () {
    this._tone(880, 0, 0.22, 'sine', 0.20);
    this._tone(1318.5, 0.07, 0.34, 'sine', 0.16);
    this._tone(1760, 0.14, 0.30, 'triangle', 0.07);
  };

  // A soft low thud for a wrong click.
  SoundBank.prototype.miss = function () {
    this._tone(160, 0, 0.16, 'sine', 0.22);
    this._tone(110, 0.02, 0.20, 'triangle', 0.10);
  };

  // A short blip when the hint button is pressed.
  SoundBank.prototype.hint = function () {
    this._tone(659.3, 0, 0.12, 'sine', 0.14);
    this._tone(987.8, 0.08, 0.18, 'sine', 0.12);
  };

  // One tick as the clock runs low.
  SoundBank.prototype.tick = function () {
    this._tone(1200, 0, 0.05, 'square', 0.045);
  };

  // A little arpeggio when a level is cleared.
  SoundBank.prototype.fanfare = function () {
    var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    for (var i = 0; i < notes.length; i++) {
      this._tone(notes[i], i * 0.09, 0.32, 'triangle', 0.16);
    }
    this._tone(261.6, 0, 0.55, 'sine', 0.10);
  };

  // A soft click for buttons and menu moves.
  SoundBank.prototype.click = function () {
    this._tone(740, 0, 0.06, 'sine', 0.08);
  };

  SoundBank.prototype.toggleMute = function () {
    this.muted = !this.muted;
    return this.muted;
  };

  global.SoundBank = SoundBank;
})(window);
