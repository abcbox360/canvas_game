const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const ww = window.innerWidth > 1000 ? 1000 : window.innerWidth;
const wh = window.innerHeight > 550 ? 550 : window.innerHeight;
canvas.width = ww;
canvas.height = wh;
let mousePos = {
  x: 0,
  y: 0,
};
const degToPi = (Math.PI * 2) / 360;
var imgSpaceHeart = new Image();
var imgHeart = new Image();
imgSpaceHeart.src = "./spaceheart.png";
imgHeart.src = "./heart.png";

class Ship {
  constructor(args) {
    let def = {
      x: ww / 2,
      y: wh / 2,
      r: 30,
      deg: 0,
      heart: 3,
      dashDeg: 0,
      fortDeg: 0,
      moveUp: false,
      moveDown: false,
      moveRight: false,
      moveLeft: false,
    };
    Object.assign(def, args);
    Object.assign(this, def);
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.fortDeg);
    //砲台
    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";
    ctx.fillStyle = "white";
    ctx.fillRect(this.r + 20, -8, 16, 16);
    ctx.beginPath();
    ctx.arc(this.r + 34, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    //護盾
    ctx.beginPath();
    ctx.arc(0, 0, this.r + 20, Math.PI * 0.75, Math.PI * 1.25);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    //船身
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.deg);
    ctx.shadowBlur = 20;
    if (this.heart < 2) {
      if (time % 120 > 0 && time % 120 < 60) {
        ctx.shadowColor = "rgba(256,0,0,0.8)";
      } else {
        ctx.shadowColor = "rgba(256,0,0,0.5)";
      }
    } else {
      ctx.shadowColor = "white";
    }
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.stroke();
    //船內線條
    for (let i = 0; i < 3; i++) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -this.r);
      ctx.stroke();
      ctx.rotate((Math.PI * 2) / 3);
    }
    ctx.closePath();
    ctx.beginPath();
    ctx.rotate(this.dashDeg);
    ctx.arc(0, 0, this.r + 10, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.setLineDash([3]);
    ctx.stroke();
    ctx.restore();
  }
  update() {
    ship.fortDeg = Math.atan2(mousePos.y - ship.y, mousePos.x - ship.x);
    ship.deg += 0.01;
    ship.dashDeg -= 0.02;
  }
}

class Bullet {
  constructor(args) {
    let def = {
      x: 0,
      y: 0,
      v: {
        x: 2,
        y: 2,
      },
    };
    Object.assign(def, args);
    Object.assign(this, def);
  }
  update() {
    this.x += this.v.x;
    this.y += this.v.y;
  }
  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.shadowBlur = 0;
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

class Enemy {
  constructor(args) {
    let def = {
      x: ww * Math.random(),
      y: 30,
      r: 10 + 5 * Math.random(),
      distance: 1 + 0.5 * Math.random(),
      v: {
        x: 2,
        y: 2,
      },
      deg: 0,
      hit: 0,
      shot: Math.round(Math.random() * 300, 0),
      boomv: {
        x: 1,
        y: 1,
      },
      boomTime: 0.5 * fps,
      run: 1,
    };
    Object.assign(def, args);
    Object.assign(this, def);
  }
  draw() {
    if (this.hit === 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.beginPath();
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#F5AF5F";
      ctx.fillStyle = "#F5AF5F";
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(this.x, this.y);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        switch (i) {
          case 0:
            ctx.arc(this.boomv.x, this.boomv.y, this.r - 5, 0, Math.PI * 2);
            break;
          case 1:
            ctx.arc(-this.boomv.x, this.boomv.y, this.r - 5, 0, Math.PI * 2);
            break;
          case 2:
            ctx.arc(-this.boomv.x, -this.boomv.y, this.r - 5, 0, Math.PI * 2);
            break;
          case 3:
            ctx.arc(this.boomv.x, -this.boomv.y, this.r - 5, 0, Math.PI * 2);
            break;
        }
        ctx.fillStyle = `rgba(256, 256, 256, ${this.boomTime / fps})`;
        ctx.fill();
        ctx.closePath();
      }
      ctx.restore();
    }
  }
  update() {
    if (this.hit === 0) {
      if (time % 600 === this.shot) {
        const eb = new EnemyBullet({
          x: this.x,
          y: this.y,
          deg: this.deg,
          v: {
            x: Math.cos(this.deg) * -1 * 1,
            y: Math.sin(this.deg) * -1 * 1,
          },
        });
        enemysBullet.push(eb);
      }
      this.deg = Math.atan2(this.y - ship.y, this.x - ship.x);
      if (
        Math.sqrt(
          Math.pow(this.y - ship.y, 2) + Math.pow(this.x - ship.x, 2)
        ) >=
        (ww / 2) * this.distance
      ) {
        this.x += this.v.x * Math.cos(this.deg) * -1;
        this.y += this.v.y * Math.sin(this.deg) * -1;
      } else {
        if (this.x >= ww || this.x <= 0 || this.y >= wh || this.y <= 0) {
          this.run *= -1;
        }
        if (Math.cos(this.deg) < 0 && Math.sin(this.deg) < 0) {
          this.x += this.v.x * Math.sin(this.deg) * -1 * this.run;
          this.y += this.v.y * Math.cos(this.deg) * this.run;
        } else if (Math.cos(this.deg) > 0 && Math.sin(this.deg) < 0) {
          this.x += this.v.x * Math.sin(this.deg) * -1 * this.run;
          this.y += this.v.y * Math.cos(this.deg) * this.run;
        } else if (Math.cos(this.deg) < 0 && Math.sin(this.deg) > 0) {
          this.x += this.v.x * Math.sin(this.deg) * -1 * this.run;
          this.y += this.v.y * Math.cos(this.deg) * this.run;
        } else if (Math.cos(this.deg) > 0 && Math.sin(this.deg) > 0) {
          this.x += this.v.x * Math.sin(this.deg) * -1 * this.run;
          this.y += this.v.y * Math.cos(this.deg) * this.run;
        }
      }
    } else if (this.boomTime > 0) {
      this.boomTime--;
      this.boomv.x++;
      this.boomv.y++;
    } else {
    }
  }
}

class EnemyBullet {
  constructor(args) {
    let def = {
      x: 100,
      y: 100,
      deg: 0,
      hit: 0,
      v: {
        x: 2,
        y: 2,
      },
      color: "#F5AF5F",
    };
    Object.assign(def, args);
    Object.assign(this, def);
  }
  update() {
    this.x += this.v.x;
    this.y += this.v.y;
  }
  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.deg);
    ctx.shadowBlur = 0;
    ctx.arc(0, -3, 6, Math.PI / 6, (Math.PI * 5) / 6);
    ctx.arc(0, 3, 6, (Math.PI * 7) / 6, (Math.PI * 11) / 6);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

let ship;
let bullets = [];
let time = 0;
let shot = false;
let enemys = [];
let wave = 0;
let score = 0;
let enemysBullet = [];
let pass = 0;
function init() {
  ship = new Ship();
  bullets = [];
  time = 0;
  shot = false;
  enemys = [];
  score = 0;
  enemysBullet = [];
  pass = 0;
  document.getElementById("score").innerHTML = score;
}
function hit() {
  //護盾抵擋子彈
  for (let i = 0; i < enemysBullet.length; i++) {
    eb = enemysBullet[i];
    if (
      ship.r + 20 <
      Math.sqrt(Math.pow(eb.x - ship.x, 2) + Math.pow(eb.y - ship.y, 2)) &&
      ship.r + 23 >
      Math.sqrt(Math.pow(eb.x - ship.x, 2) + Math.pow(eb.y - ship.y, 2))
    ) {
      const shellStart =
        ship.fortDeg + 1.25 * Math.PI >= 2 * Math.PI
          ? ship.fortDeg + 1.25 * Math.PI - 2 * Math.PI
          : ship.fortDeg + 1.25 * Math.PI;
      const shellEnd =
        ship.fortDeg + 1.75 * Math.PI >= 2 * Math.PI
          ? ship.fortDeg + 1.75 * Math.PI - 2 * Math.PI
          : ship.fortDeg + 1.75 * Math.PI;
      let ebDeg = Math.atan2(eb.y - ship.y, eb.x - ship.x);
      if (ship.x > eb.x && ship.y > eb.y) {
        ebDeg += 2.5 * Math.PI;
      } else if (ship.x > eb.x && ship.y < eb.y) {
        ebDeg += 0.5 * Math.PI;
      } else if (ship.x < eb.x && ship.y < eb.y) {
        ebDeg += 0.5 * Math.PI;
      } else if (ship.x < eb.x && ship.y > eb.y) {
        ebDeg += 0.5 * Math.PI;
      }
      if (shellStart < shellEnd) {
        if (ebDeg > shellStart && ebDeg < shellEnd) {
          enemysBullet[i].hit = 1;
          updateScore(50);
        }
      } else if (ebDeg > shellStart || ebDeg < shellEnd) {
        enemysBullet[i].hit = 1;
        updateScore(50);
      }
    }
    //敵人子彈打到玩家
    else if (
      ship.r >
      Math.sqrt(Math.pow(eb.x - ship.x, 2) + Math.pow(eb.y - ship.y, 2))
    ) {
      enemysBullet[i].hit = 1;
      ship.heart--;
      if (ship.heart === 0) {
        wave = -1;
        document.getElementById("return").classList.remove("displayNone");
        document.getElementById("playPause").classList.add("displayNone");
        document.getElementById("scoreDiv").classList.add("displayNone");
      }
    }
  }
  enemysBullet = enemysBullet.filter((eb) => eb.hit === 0);
  //子彈打到敵人
  for (let i = 0; i < enemys.length; i++) {
    if (enemys[i].hit === 0) {
      bullets.forEach((b) => {
        if (
          b.x < enemys[i].x + enemys[i].r &&
          b.x > enemys[i].x - enemys[i].r &&
          b.y < enemys[i].y + enemys[i].r &&
          b.y > enemys[i].y - enemys[i].r
        ) {
          enemys[i].hit = 1;
          updateScore(100);
        }
      });
      bullets = bullets.filter(
        (b) =>
          !(
            b.x < enemys[i].x + enemys[i].r &&
            b.x > enemys[i].x - enemys[i].r &&
            b.y < enemys[i].y + enemys[i].r &&
            b.y > enemys[i].y - enemys[i].r
          )
      );
    }
  }
}
//畫愛心
function Heart() {
  ctx.beginPath();
  for (let i = 0; i < 3; i++)
    if (ship.heart > i) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = "white";
      ctx.drawImage(imgHeart, 0, 0, 16, 16, ww - 40 * (i + 1), 10, 32, 32);
    } else {
      ctx.shadowBlur = 5;
      ctx.drawImage(imgSpaceHeart, 0, 0, 16, 16, ww - 40 * (i + 1), 10, 32, 32);
    }
  ctx.closePath();
}
//畫暫停
function PlayPause() {
  ctx.save();
  ctx.translate(ww - 50, wh - 50);
  ctx.shadowBlur = 20;
  if (pass) {
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.moveTo(10, 10);
    ctx.lineTo(40, 25);
    ctx.lineTo(10, 40);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.moveTo(18, 10);
    ctx.lineTo(18, 40);
    ctx.moveTo(32, 10);
    ctx.lineTo(32, 40);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}
//分數計算
function updateScore(point) {
  score += point;
  document.getElementById("score").innerHTML = score;
}

function update() {
  time++;
  //開始前畫面
  if (wave === 0) {
  }

  //遊戲開始
  if (wave > 0) {
    ship.update();
    enemys.forEach((e) => e.update());
    bullets.forEach((b) => b.update());
    enemysBullet.forEach((eb) => eb.update());
    enemysBullet = enemysBullet.filter(
      (eb) => eb.x < ww && eb.x > 0 && eb.y < wh && eb.y > 0
    );
    bullets = bullets.filter((b) => b.x < ww && b.x > 0 && b.y < wh && b.y > 0);
    enemys = enemys.filter((e) => e.boomTime > 0);
    if (enemys.length === 0) {
      if (wave > 0) {
        enemysBullet = [];
        for (let i = 0; i < 3 * wave; i++) {
          const e = new Enemy();
          enemys.push(e);
        }
      }
      wave++;
    }
    hit();
    if (time % 10 === 0 && shot) {
      let b = new Bullet({
        x: ship.x + Math.cos(ship.fortDeg) * 80,
        y: ship.y + Math.sin(ship.fortDeg) * 80,
        v: {
          x: Math.cos(ship.fortDeg) * 8,
          y: Math.sin(ship.fortDeg) * 8,
        },
      });
      bullets.push(b);
    }
  }
  //遊戲結束
  if (wave === -1) {
  }
}

function draw() {
  //背景&格線
  ctx.save();
  ctx.fillStyle = "#001D2E";
  ctx.fillRect(0, 0, ww, wh);
  let span = 50;
  ctx.beginPath();
  for (let i = 0; i < ww; i += span) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, wh);
  }
  ctx.translate(0, time % span);
  for (let i = 0; i < wh; i += span) {
    ctx.moveTo(0, i);
    ctx.lineTo(ww, i);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.stroke();
  ctx.restore();

  if (wave === 0) {
  }
  //遊戲開始
  if (wave > 0) {
    ship.draw();
    enemys.forEach((e) => e.draw());
    bullets.forEach((b) => b.draw());
    enemysBullet.forEach((eb) => eb.draw());
    Heart();
    PlayPause();
  }
  //遊戲結束
  if (wave === -1) {
    ctx.font = "40px sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER", ww / 2 - 120, wh / 2 - 20);
    ctx.font = "26px sans-serif";
    ctx.fillText("SCORE:" + score, ww / 2 - 80, wh / 2 + 30);
  }
  requestAnimationFrame(draw);
}

let fps = 60;
init();
let interval = setInterval(() => {
  pass ? clearInterval(interval) : update();
}, 1000 / fps);

requestAnimationFrame(draw);

//事件監聽
canvas.focus();
const hasTouchEvent = "ontouchstart" in window ? true : false;
const downEvent = hasTouchEvent ? "touchstart" : "mousedown";
const moveEvent = hasTouchEvent ? "touchmove" : "mousemove";
const upEvent = hasTouchEvent ? "touchend" : "mouseup";
canvas.addEventListener(moveEvent, function (e) {
  mousePos.x = e.x ? e.x : e.touches[0].pageX;
  mousePos.y = e.y ? e.y : e.touches[0].pageY;
  if (window.innerWidth > 1000) {
    mousePos.x += 500 - window.innerWidth / 2;
  }
});
canvas.addEventListener(downEvent, function (e) {
  mousePos.x = e.x ? e.x : e.touches[0].pageX;
  mousePos.y = e.y ? e.y : e.touches[0].pageY;
  shot = true;
});
canvas.addEventListener(upEvent, function (e) {
  shot = false;
});
document.getElementById("playPause").addEventListener("click", () => {
  if (pass) {
    pass = !pass;
    interval = setInterval(() => {
      pass ? clearInterval(interval) : update();
    }, 1000 / fps);
    requestAnimationFrame(draw);
  } else {
    pass = !pass;
  }
});
document.getElementById("start").addEventListener("click", () => {
  wave++;
  document.getElementById("playPause").classList.remove("displayNone");
  document.getElementById("start").classList.add("displayNone");
});
document.getElementById("return").addEventListener("click", () => {
  wave = 0;
  init();
  document.getElementById("start").classList.remove("displayNone");
  document.getElementById("scoreDiv").classList.remove("displayNone");
  document.getElementById("return").classList.add("displayNone");
});
