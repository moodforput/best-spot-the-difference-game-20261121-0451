// Scenes — every picture in LUMEN & LARK is drawn in code, twice: once for the
// left panel and once for the right, with a set of small deliberate variations.
// A painter takes (ctx, W, H, diffs): diffs is a Set of difference ids to apply,
// so the two panels differ exactly where the level says they do. Scene space is
// always 560 x 420; the canvas is backed at 2x for crisp lines.
(function (global) {
  'use strict';

  var W = 560;
  var H = 420;

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function poly(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  function bird(ctx, x, y, s) {
    ctx.strokeStyle = '#1d2333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.7, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.7, x + s, y);
    ctx.stroke();
  }

  function star(ctx, x, y, r, color) {
    ctx.fillStyle = color || '#ffe9a8';
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = (i * Math.PI) / 4;
      var rad = i % 2 === 0 ? r : r * 0.45;
      var px = x + Math.cos(a) * rad;
      var py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  // ---- Level 1: Harbor Dusk -------------------------------------------------
  function paintHarbor(ctx, diffs) {
    // Sky: indigo dusk melting into ember orange at the horizon.
    var sky = ctx.createLinearGradient(0, 0, 0, 250);
    sky.addColorStop(0, '#2b2a55');
    sky.addColorStop(0.55, '#7a4a6e');
    sky.addColorStop(1, '#e8825a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 252);

    // Stars, one of which is a difference.
    star(ctx, 60, 40, 5);
    star(ctx, 120, 70, 3.5);
    star(ctx, 200, 30, 4);
    star(ctx, 90, 110, 3);
    star(ctx, 300, 50, 3.5);
    if (!diffs.has('star')) star(ctx, 60, 40, 7, '#fff3c4');

    // Low sun with a warm glow.
    var glow = ctx.createRadialGradient(420, 140, 8, 420, 140, 90);
    glow.addColorStop(0, 'rgba(255, 214, 130, 0.9)');
    glow.addColorStop(1, 'rgba(255, 214, 130, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(320, 40, 200, 200);
    ctx.fillStyle = '#ffd682';
    circle(ctx, 420, 140, 34);
    ctx.fillStyle = '#ffedb0';
    circle(ctx, 420, 140, 26);

    // Clouds.
    ctx.fillStyle = 'rgba(255, 190, 160, 0.55)';
    ctx.beginPath();
    ctx.ellipse(150, 90, 70, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(200, 100, 50, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 170, 140, 0.45)';
    ctx.beginPath();
    ctx.ellipse(330, 70, 60, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sea.
    var sea = ctx.createLinearGradient(0, 250, 0, H);
    sea.addColorStop(0, '#2a5a6e');
    sea.addColorStop(1, '#0d2233');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 250, W, H - 250);
    // Sun glitter on the water.
    ctx.fillStyle = 'rgba(255, 214, 130, 0.5)';
    for (var i = 0; i < 9; i++) {
      var gy = 258 + i * 16;
      var gw = 26 + (i % 3) * 14;
      ctx.fillRect(420 - gw / 2, gy, gw, 3);
    }
    // Wave strokes.
    ctx.strokeStyle = 'rgba(180, 220, 230, 0.35)';
    ctx.lineWidth = 2;
    for (var w = 0; w < 7; w++) {
      var wy = 275 + w * 20;
      ctx.beginPath();
      ctx.moveTo(20 + (w % 2) * 30, wy);
      ctx.quadraticCurveTo(90 + (w % 2) * 40, wy - 5, 170 + (w % 2) * 30, wy);
      ctx.stroke();
    }

    // Birds.
    bird(ctx, 150, 80, 9);
    bird(ctx, 260, 95, 8);
    if (!diffs.has('bird')) bird(ctx, 210, 60, 9);

    // Lighthouse, striped, on the left point.
    ctx.fillStyle = '#3a2e22';
    poly(ctx, [[55, 330], [125, 330], [118, 300], [62, 300]]);
    ctx.fillStyle = '#f4ede0';
    poly(ctx, [[66, 300], [114, 300], [110, 210], [70, 210]]);
    ctx.fillStyle = '#c0392b';
    poly(ctx, [[68, 270], [112, 270], [110, 240], [70, 240]]);
    poly(ctx, [[71, 210], [109, 210], [108, 195], [72, 195]]);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(68, 178, 44, 20);
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(74, 182, 32, 12);
    ctx.fillStyle = '#2c3e50';
    poly(ctx, [[64, 178], [116, 178], [90, 162]]);
    // The beam is a difference: present on one side only.
    if (diffs.has('beam')) {
      var beam = ctx.createLinearGradient(110, 185, 340, 120);
      beam.addColorStop(0, 'rgba(255, 233, 168, 0.75)');
      beam.addColorStop(1, 'rgba(255, 233, 168, 0)');
      ctx.fillStyle = beam;
      poly(ctx, [[110, 178], [110, 196], [340, 150], [340, 110]]);
    }

    // Pier with posts.
    ctx.fillStyle = '#5d4128';
    ctx.fillRect(0, 318, 250, 12);
    ctx.fillStyle = '#7a5a38';
    for (var p = 0; p < 6; p++) ctx.fillRect(8 + p * 42, 318, 4, 12);
    ctx.fillStyle = '#4a3320';
    ctx.fillRect(30, 330, 10, 60);
    ctx.fillRect(120, 330, 10, 60);
    ctx.fillRect(210, 330, 10, 60);

    // Houses on the right shore.
    function house(x, y, w, h, wall, roof) {
      ctx.fillStyle = wall;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = roof;
      poly(ctx, [[x - 6, y], [x + w / 2, y - 26], [x + w + 6, y]]);
      ctx.fillStyle = '#2c2a33';
      ctx.fillRect(x + 8, y + 8, 14, 16);
      ctx.fillRect(x + w - 22, y + 8, 14, 16);
    }
    house(380, 262, 70, 66, '#e8b04b', '#8e3b2f');
    house(455, 250, 80, 78, '#d97b4f', '#5d2e3a');
    // The one lit window is a difference.
    ctx.fillStyle = diffs.has('window') ? '#2c2a33' : '#ffe9a8';
    ctx.fillRect(470, 282, 14, 16);
    ctx.fillStyle = '#2c2a33';
    ctx.fillRect(500, 282, 14, 16);

    // Boats. The big sail's colour is a difference.
    function boat(x, y, sailColor, hullColor) {
      ctx.fillStyle = hullColor;
      poly(ctx, [[x - 26, y], [x + 26, y], [x + 16, y + 12], [x - 16, y + 12]]);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(x - 1, y - 34, 3, 36);
      ctx.fillStyle = sailColor;
      poly(ctx, [[x + 2, y - 34], [x + 2, y - 2], [x + 24, y - 2]]);
      ctx.fillStyle = '#f4ede0';
      poly(ctx, [[x - 2, y - 30], [x - 2, y - 2], [x - 20, y - 2]]);
    }
    boat(300, 330, diffs.has('sail') ? '#2e8b8b' : '#c0392b', '#3a2e22');
    boat(465, 365, '#f4ede0', '#2c2a33');
  }

  // ---- Level 2: The Night Market --------------------------------------------
  function paintMarket(ctx, diffs) {
    var sky = ctx.createLinearGradient(0, 0, 0, 210);
    sky.addColorStop(0, '#241b3a');
    sky.addColorStop(1, '#5a2d55');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 212);
    star(ctx, 80, 40, 3.5);
    star(ctx, 200, 60, 3);
    star(ctx, 350, 35, 4);
    star(ctx, 150, 110, 3);

    // Moon: full, or a crescent when the difference is applied.
    ctx.fillStyle = '#f7ead0';
    circle(ctx, 480, 60, 26);
    ctx.fillStyle = '#e8d5a8';
    circle(ctx, 472, 54, 5);
    circle(ctx, 488, 68, 4);
    if (diffs.has('moon')) {
      ctx.fillStyle = '#241b3a';
      circle(ctx, 492, 52, 22);
    }

    // String lights sagging across the top.
    ctx.strokeStyle = '#1d1428';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.quadraticCurveTo(280, 78, 560, 24);
    ctx.stroke();
    for (var b = 0; b < 13; b++) {
      var t = b / 12;
      var bx = t * 560;
      // The wire sags: lowest at the middle, rising to both ends.
      var by = 26 + Math.sin(t * Math.PI) * 44;
      var lit = !(diffs.has('bulb') && b === 6);
      ctx.fillStyle = lit ? '#ffd682' : '#3a2f4a';
      circle(ctx, bx, by, 6);
      if (lit) {
        ctx.fillStyle = 'rgba(255, 214, 130, 0.25)';
        circle(ctx, bx, by, 11);
      }
    }

    // Paper lanterns.
    function lantern(x, y, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, 16, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x - 16, y - 4, 32, 3);
      ctx.fillRect(x - 16, y + 4, 32, 3);
      ctx.fillStyle = '#ffd682';
      circle(ctx, x, y, 4);
      ctx.fillStyle = '#2c2a33';
      ctx.fillRect(x - 6, y - 24, 12, 4);
    }
    lantern(120, 120, '#c0392b');
    lantern(430, 110, diffs.has('lantern') ? '#2e8b57' : '#c0392b');

    // Stalls with striped awnings.
    function awning(x, y, w, c1, c2) {
      for (var s = 0; s < 6; s++) {
        ctx.fillStyle = s % 2 === 0 ? c1 : c2;
        ctx.fillRect(x + (s * w) / 6, y, w / 6 + 1, 26);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(x, y + 22, w, 4);
    }
    function stall(x, y, w, wall) {
      ctx.fillStyle = wall;
      ctx.fillRect(x, y, w, 96);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(x - 4, y + 92, w + 8, 8);
      ctx.fillStyle = '#7a5a38';
      ctx.fillRect(x, y, w, 8);
    }
    // Stall A: fruit.
    awning(20, 205, 150, '#c0392b', '#f4ede0');
    stall(20, 231, 150, '#6b4a2f');
    ctx.fillStyle = '#e8823a';
    for (var f = 0; f < 5; f++) circle(ctx, 45 + f * 22, 248, 9);
    ctx.fillStyle = '#7cb342';
    for (var g = 0; g < 4; g++) circle(ctx, 52 + g * 24, 268, 8);
    // Stall B: jars, and a sign that is a difference.
    awning(200, 205, 150, diffs.has('awning') ? '#d98e2b' : '#2e8b8b', '#f4ede0');
    stall(200, 231, 150, '#5d3a4a');
    ctx.fillStyle = '#b7a6c9';
    rr(ctx, 220, 244, 22, 26, 4);
    rr(ctx, 252, 244, 22, 26, 4);
    rr(ctx, 284, 244, 22, 26, 4);
    ctx.fillStyle = '#2c2a33';
    ctx.fillRect(316, 244, 20, 26);
    ctx.fillStyle = '#f4ede0';
    ctx.fillRect(238, 182, 74, 22);
    ctx.fillStyle = '#2c2a33';
    if (diffs.has('sign')) {
      // A star on the sign.
      star(ctx, 275, 193, 7, '#2c2a33');
    } else {
      // A little fish on the sign.
      ctx.beginPath();
      ctx.ellipse(275, 193, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      poly(ctx, [[286, 193], [294, 187], [294, 199]]);
    }
    // Stall C: bread.
    awning(380, 205, 160, '#d98e2b', '#f4ede0');
    stall(380, 231, 160, '#6b4a2f');
    ctx.fillStyle = '#d9a05b';
    for (var lo = 0; lo < 4; lo++) {
      ctx.beginPath();
      ctx.ellipse(410 + lo * 32, 252, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#8e6a3a';
    for (var lo2 = 0; lo2 < 3; lo2++) {
      ctx.beginPath();
      ctx.ellipse(425 + lo2 * 34, 272, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground and crates. The stack is taller on one side.
    ctx.fillStyle = '#3a2a3a';
    ctx.fillRect(0, 330, W, 90);
    ctx.fillStyle = '#2c2030';
    ctx.fillRect(0, 330, W, 6);
    ctx.fillStyle = '#8a6a42';
    ctx.fillRect(44, 356, 34, 30);
    ctx.fillRect(82, 356, 34, 30);
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(44, 356, 34, 4);
    ctx.fillRect(82, 356, 34, 4);
    if (diffs.has('crates')) {
      ctx.fillStyle = '#8a6a42';
      ctx.fillRect(61, 326, 34, 30);
      ctx.fillStyle = '#6b4a2f';
      ctx.fillRect(61, 326, 34, 4);
    }

    // The market cat, sitting by stall B — present on one side only.
    if (!diffs.has('cat')) {
      ctx.fillStyle = '#1d1428';
      ctx.beginPath();
      ctx.ellipse(330, 372, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      circle(ctx, 322, 352, 10);
      poly(ctx, [[314, 346], [312, 334], [320, 342]]);
      poly(ctx, [[330, 346], [332, 334], [336, 342]]);
      ctx.beginPath();
      ctx.moveTo(346, 378);
      ctx.quadraticCurveTo(362, 372, 358, 352);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#1d1428';
      ctx.stroke();
      ctx.fillStyle = '#ffd682';
      circle(ctx, 319, 351, 1.6);
      circle(ctx, 325, 351, 1.6);
    }

    // A basket of flowers near stall C.
    ctx.fillStyle = '#7a4a3a';
    poly(ctx, [[470, 360], [510, 360], [504, 384], [476, 384]]);
    ctx.fillStyle = '#e86a8a';
    circle(ctx, 478, 352, 6);
    circle(ctx, 494, 348, 6);
    circle(ctx, 505, 354, 6);
    ctx.fillStyle = '#f4ede0';
    circle(ctx, 486, 356, 5);
  }

  // ---- Level 3: Clockmaker's Attic -------------------------------------------
  function paintAttic(ctx, diffs) {
    // Wooden plank wall and floor.
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(0, 0, W, 300);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (var pl = 0; pl < 6; pl++) ctx.fillRect(0, 48 + pl * 48, W, 3);
    ctx.fillStyle = '#54382a';
    ctx.fillRect(0, 300, W, 120);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (var fl = 0; fl < 5; fl++) ctx.fillRect(0, 322 + fl * 20, W, 2);
    ctx.fillStyle = '#8a6a42';
    ctx.fillRect(0, 296, W, 6);

    // Round window with the night outside; the moon is a difference.
    ctx.fillStyle = '#2c3e50';
    circle(ctx, 470, 90, 48);
    ctx.fillStyle = '#1d2a44';
    circle(ctx, 470, 90, 42);
    if (!diffs.has('moon')) {
      ctx.fillStyle = '#f7ead0';
      circle(ctx, 478, 80, 14);
    }
    star(ctx, 452, 66, 3);
    star(ctx, 492, 108, 3);
    ctx.strokeStyle = '#8a6a42';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(470, 90, 45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(470, 45);
    ctx.lineTo(470, 135);
    ctx.moveTo(425, 90);
    ctx.lineTo(515, 90);
    ctx.stroke();

    // Hanging lamp, lit or dark.
    ctx.strokeStyle = '#2c2a33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, 34);
    ctx.stroke();
    ctx.fillStyle = '#3a2e22';
    poly(ctx, [[284, 34], [316, 34], [306, 52], [294, 52]]);
    if (!diffs.has('lamp')) {
      var lampGlow = ctx.createRadialGradient(300, 62, 4, 300, 62, 90);
      lampGlow.addColorStop(0, 'rgba(255, 214, 130, 0.55)');
      lampGlow.addColorStop(1, 'rgba(255, 214, 130, 0)');
      ctx.fillStyle = lampGlow;
      ctx.fillRect(200, 0, 200, 170);
      ctx.fillStyle = '#ffd682';
      circle(ctx, 300, 60, 10);
    } else {
      ctx.fillStyle = '#5d5648';
      circle(ctx, 300, 60, 10);
    }

    // The great wall clock.
    ctx.fillStyle = '#8e6a3a';
    circle(ctx, 150, 120, 74);
    ctx.fillStyle = '#f4ead2';
    circle(ctx, 150, 120, 66);
    ctx.fillStyle = '#2c2a33';
    for (var h = 0; h < 12; h++) {
      var a = (h * Math.PI) / 6;
      var hx = 150 + Math.sin(a) * 58;
      var hy = 120 - Math.cos(a) * 58;
      circle(ctx, hx, hy, h % 3 === 0 ? 4 : 2);
    }
    // Hands: hour to 10, minute to 2 — or to 4 when the difference is applied.
    ctx.strokeStyle = '#2c2a33';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(150, 120);
    ctx.lineTo(150 + Math.sin(-Math.PI / 3) * 34, 120 - Math.cos(-Math.PI / 3) * 34);
    ctx.stroke();
    ctx.lineWidth = 4;
    var minAngle = diffs.has('hand') ? (Math.PI * 2) / 3 : Math.PI / 3;
    ctx.beginPath();
    ctx.moveTo(150, 120);
    ctx.lineTo(150 + Math.sin(minAngle) * 52, 120 - Math.cos(minAngle) * 52);
    ctx.stroke();
    ctx.fillStyle = '#c0392b';
    circle(ctx, 150, 120, 5);
    // Pendulum case and swinging bob.
    ctx.fillStyle = '#5d3a2a';
    rr(ctx, 128, 190, 44, 84, 6);
    ctx.fillStyle = '#f4ead2';
    rr(ctx, 134, 196, 32, 72, 4);
    var swing = diffs.has('pendulum') ? 0.22 : -0.22;
    var px = 150 + Math.sin(swing) * 26;
    var py = 196 + Math.cos(swing) * 26;
    ctx.strokeStyle = '#8e6a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 196);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.fillStyle = '#c9a227';
    circle(ctx, px, py + 12, 11);

    // Gears on the bench below the clock.
    function gear(cx, cy, r, teeth, missingTooth) {
      ctx.fillStyle = '#b08d3e';
      ctx.beginPath();
      for (var t = 0; t < teeth; t++) {
        if (missingTooth && t === 2) continue;
        var ta = (t / teeth) * Math.PI * 2;
        var tx = cx + Math.cos(ta) * (r + 5);
        var ty = cy + Math.sin(ta) * (r + 5);
        ctx.moveTo(cx + Math.cos(ta) * r, cy + Math.sin(ta) * r);
        ctx.lineTo(tx, ty);
      }
      ctx.stroke();
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b4a2f';
      circle(ctx, cx, cy, r * 0.45);
      ctx.fillStyle = '#b08d3e';
      circle(ctx, cx, cy, 4);
    }
    ctx.strokeStyle = '#b08d3e';
    ctx.lineWidth = 6;
    gear(110, 292, 20, 8, false);
    gear(190, 292, 24, 9, diffs.has('gear'));

    // Shelves with books and jars.
    ctx.fillStyle = '#54382a';
    ctx.fillRect(330, 178, 200, 8);
    ctx.fillRect(330, 238, 200, 8);
    var bookColors = ['#c0392b', '#2e6b8a', '#2e8b57', '#d98e2b', '#7a4a8a'];
    for (var bk = 0; bk < 5; bk++) {
      ctx.fillStyle = diffs.has('book') && bk === 1 ? '#c0392b' : bookColors[bk];
      ctx.fillRect(340 + bk * 17, 146, 14, 32);
    }
    ctx.fillStyle = '#b7a6c9';
    rr(ctx, 440, 150, 18, 28, 4);
    rr(ctx, 464, 150, 18, 28, 4);
    ctx.fillStyle = '#d9c9a8';
    rr(ctx, 340, 210, 20, 28, 4);
    rr(ctx, 366, 210, 20, 28, 4);
    if (diffs.has('jar')) {
      ctx.fillStyle = '#d9c9a8';
      rr(ctx, 496, 210, 20, 28, 4);
    }

    // Workbench with tools. The hammer is a difference.
    ctx.fillStyle = '#5d4128';
    ctx.fillRect(16, 336, 190, 10);
    ctx.fillStyle = '#4a3320';
    ctx.fillRect(26, 346, 10, 54);
    ctx.fillRect(186, 346, 10, 54);
    ctx.strokeStyle = '#8a8a8a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, 336);
    ctx.lineTo(70, 318);
    ctx.stroke();
    ctx.fillStyle = '#c9c9c9';
    circle(ctx, 72, 316, 6);
    if (!diffs.has('tool')) {
      ctx.fillStyle = '#8a6a42';
      ctx.fillRect(110, 322, 6, 14);
      ctx.fillStyle = '#5d5d5d';
      ctx.fillRect(100, 314, 26, 10);
    }
    ctx.fillStyle = '#b08d3e';
    circle(ctx, 160, 330, 8);

    // Rug with a motif that changes.
    ctx.fillStyle = '#8e3b2f';
    ctx.beginPath();
    ctx.ellipse(300, 380, 90, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d98e2b';
    ctx.beginPath();
    ctx.ellipse(300, 380, 66, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8e3b2f';
    if (diffs.has('rug')) {
      circle(ctx, 300, 380, 9);
    } else {
      poly(ctx, [[300, 368], [312, 380], [300, 392], [288, 380]]);
    }

    // The attic cat, asleep on the rug — its tail is a difference.
    ctx.fillStyle = '#3a2f4a';
    ctx.beginPath();
    ctx.ellipse(380, 388, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 362, 380, 10);
    poly(ctx, [[354, 374], [352, 364], [360, 370]]);
    poly(ctx, [[368, 374], [370, 364], [374, 370]]);
    ctx.beginPath();
    ctx.moveTo(402, 392);
    if (diffs.has('tail')) {
      ctx.quadraticCurveTo(420, 396, 424, 384);
    } else {
      ctx.quadraticCurveTo(418, 380, 408, 374);
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#3a2f4a';
    ctx.stroke();
  }

  var painters = {
    harbor: paintHarbor,
    market: paintMarket,
    attic: paintAttic,
  };

  // Paint one panel of a level: `applied` is the Set of difference ids drawn
  // in their changed form on this panel.
  function paintScene(ctx, sceneKey, applied) {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    painters[sceneKey](ctx, applied);
    ctx.restore();
  }

  global.Scenes = {
    W: W,
    H: H,
    paintScene: paintScene,
  };
})(window);
