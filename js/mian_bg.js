(function () {
  const pi = Math.PI;
  const pi2 = 2 * Math.PI;

  // Waves 생성자 함수
  this.Waves = function (holder, options) {
    const Waves = this;

    // 기본 옵션 설정
    Waves.options = extend(options || {}, {
      resize: false,
      rotation: 45,
      waves: 5,
      width: 200, // 파도의 너비
      hue: [11, 14],
      amplitude: 1, // 파도의 진폭
      background: true,
      preload: true,
      speed: [0.004, 0.008],
      debug: false,
      fps: false, // FPS 표시 제거
    });

    Waves.waves = [];

    // 캔버스 초기화
    Waves.holder = document.querySelector(holder);
    Waves.canvas = document.createElement("canvas");
    Waves.ctx = Waves.canvas.getContext("2d");
    Waves.holder.appendChild(Waves.canvas);

    Waves.hue = Waves.options.hue[0];
    Waves.hueFw = true;
    Waves.stats = new Stats();

    Waves.resize();
    Waves.init(Waves.options.preload);

    // 창 크기 조정 시 호출되는 이벤트 리스너 추가
    if (Waves.options.resize)
      window.addEventListener(
        "resize",
        function () {
          Waves.resize();
        },
        false
      );
  };

  // 파도 초기화
  Waves.prototype.init = function (preload) {
    const Waves = this;
    const options = Waves.options;

    // 파도 생성
    for (let i = 0; i < options.waves; i++) Waves.waves[i] = new Wave(Waves);

    if (preload) Waves.preload();
  };

  // 색상 미리 로딩
  Waves.prototype.preload = function () {
    const Waves = this;
    const options = Waves.options;

    for (let i = 0; i < options.waves; i++) {
      Waves.updateColor();
      for (let j = 0; j < options.width; j++) {
        Waves.waves[i].update();
      }
    }
  };

  // 화면에 그리기
  Waves.prototype.render = function () {
    const Waves = this;
    const ctx = Waves.ctx;
    const options = Waves.options;

    Waves.updateColor();
    Waves.clear();

    if (Waves.options.debug) {
      ctx.beginPath();
      ctx.strokeStyle = "#f00";
      ctx.arc(Waves.centerX, Waves.centerY, Waves.radius, 0, pi2);
      ctx.stroke();
    }

    if (Waves.options.background) {
      Waves.background();
    }

    each(Waves.waves, function (wave, i) {
      wave.update();
      wave.draw();
    });
  };

  // 애니메이션 루프
  Waves.prototype.animate = function () {
    const Waves = this;

    Waves.render();

    window.requestAnimationFrame(Waves.animate.bind(Waves));
  };

  // 캔버스 지우기
  Waves.prototype.clear = function () {
    const Waves = this;
    Waves.ctx.clearRect(0, 0, Waves.width, Waves.height);
  };

  // 배경 그리기
  Waves.prototype.background = function () {
    const Waves = this;
    const ctx = Waves.ctx;

    const gradient = Waves.ctx.createLinearGradient(0, 0, 0, Waves.height);
    // gradient.addColorStop(0, "#191715"); // 갈색
    gradient.addColorStop(0, "#ffffff"); // 흙갈
    gradient.addColorStop(1, Waves.color);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, Waves.width, Waves.height);
  };

  // 캔버스 크기 조정
  Waves.prototype.resize = function () {
    const Waves = this;
    const width = Waves.holder.offsetWidth;
    const height = Waves.holder.offsetHeight;
    Waves.scale = window.devicePixelRatio || 1;
    Waves.width = width * Waves.scale;
    Waves.height = height * Waves.scale;
    Waves.canvas.width = Waves.width;
    Waves.canvas.height = Waves.height;
    Waves.canvas.style.width = width + "px";
    Waves.canvas.style.height = height + "px";
    Waves.radius =
      Math.sqrt(Math.pow(Waves.width, 2) + Math.pow(Waves.height, 2)) / 2;
    Waves.centerX = Waves.width / 2;
    Waves.centerY = Waves.height / 2;
  };

  // 색상 업데이트
  Waves.prototype.updateColor = function () {
    const Waves = this;

    Waves.hue += Waves.hueFw ? 0.01 : -0.01;

    if (Waves.hue > Waves.options.hue[1] && Waves.hueFw) {
      Waves.hue = Waves.options.hue[1];
      Waves.Waves = false;
    } else if (Waves.hue < Waves.options.hue[0] && !Waves.hueFw) {
      Waves.hue = Waves.options.hue[0];
      Waves.Waves = true;
    }

    const a = Math.floor(127 * Math.sin(0.3 * Waves.hue + 0) + 128);
    const b = Math.floor(127 * Math.sin(0.3 * Waves.hue + 2) + 128);
    const c = Math.floor(127 * Math.sin(0.3 * Waves.hue + 4) + 128);

    Waves.color = "rgba(72, 10, 10, 0.1)";
  };

  // Wave 생성자 함수
  function Wave(Waves) {
    const Wave = this;
    const speed = Waves.options.speed;

    Wave.Waves = Waves;
    Wave.Lines = [];

    Wave.angle = [rnd(pi2), rnd(pi2), rnd(pi2), rnd(pi2)];

    Wave.speed = [
      rnd(speed[0], speed[1]) * rnd_sign(),
      rnd(speed[0], speed[1]) * rnd_sign(),
      rnd(speed[0], speed[1]) * rnd_sign(),
      rnd(speed[0], speed[1]) * rnd_sign(),
    ];

    return Wave;
  }

  // 파도 업데이트
  Wave.prototype.update = function () {
    const Wave = this;
    const Lines = Wave.Lines;
    const color = Wave.Waves.color;

    Lines.push(new Line(Wave, color));

    if (Lines.length > Wave.Waves.options.width) {
      Lines.shift();
    }
  };

  // 파도 그리기
  Wave.prototype.draw = function () {
    const Wave = this;
    const Waves = Wave.Waves;

    const ctx = Waves.ctx;
    const radius = Waves.radius;
    const radius3 = radius / 3;
    const x = Waves.centerX;
    const y = Waves.centerY;
    const rotation = dtr(Waves.options.rotation);
    const amplitude = Waves.options.amplitude;
    const debug = Waves.options.debug;

    const Lines = Wave.Lines;

    each(Lines, function (line, i) {
      if (debug && i > 0) return;

      const angle = line.angle;

      const x1 = x - radius * Math.cos(angle[0] * amplitude + rotation);
      const y1 = y - radius * Math.sin(angle[0] * amplitude + rotation);
      const x2 = x + radius * Math.cos(angle[3] * amplitude + rotation);
      const y2 = y + radius * Math.sin(angle[3] * amplitude + rotation);
      const cpx1 = x - radius3 * Math.cos(angle[1] * amplitude * 2);
      const cpy1 = y - radius3 * Math.sin(angle[1] * amplitude * 2);
      const cpx2 = x + radius3 * Math.cos(angle[2] * amplitude * 2);
      const cpy2 = y - radius3 * Math.sin(angle[2] * amplitude * 2);

      ctx.strokeStyle = debug ? "#fff" : line.color;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
      ctx.stroke();

      if (debug) {
        ctx.strokeStyle = "#fff";
        ctx.globalAlpha = 0.3;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(cpx1, cpy1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(cpx2, cpy2);
        ctx.stroke();

        ctx.globalAlpha = 1;
      }
    });
  };

  // Line 생성자 함수
  function Line(Wave, color) {
    const Line = this;

    const angle = Wave.angle;
    const speed = Wave.speed;

    Line.angle = [
      Math.sin((angle[0] += speed[0])),
      Math.sin((angle[1] += speed[1])),
      Math.sin((angle[2] += speed[2])),
      Math.sin((angle[3] += speed[3])),
    ];

    Line.color = color;
  }

  // Stats 생성자 함수
  function Stats() {
    this.data = [];
  }

  // 시간 측정
  Stats.prototype.time = function () {
    return (performance || Date).now();
  };

  // FPS 로그 기록
  Stats.prototype.log = function () {
    if (!this.last) {
      this.last = this.time();
      return 0;
    }

    this.new = this.time();
    this.delta = this.new - this.last;
    this.last = this.new;

    this.data.push(this.delta);
    if (this.data.length > 10) this.data.shift();
  };

  // FPS 계산
  Stats.prototype.fps = function () {
    let fps = 0;
    each(this.data, function (data, i) {
      fps += data;
    });

    return Math.round(1000 / (fps / this.data.length));
  };

  // 배열 반복 처리
  function each(items, callback) {
    for (let i = 0; i < items.length; i++) {
      callback(items[i], i);
    }
  }

  // 객체 병합
  function extend(options, defaults) {
    for (const key in options)
      if (defaults.hasOwnProperty(key)) defaults[key] = options[key];
    return defaults;
  }

  // 도(degree)를 라디안(radian)으로 변환
  function dtr(deg) {
    return (deg * pi) / 180;
  }

  // 라디안(radian)을 도(degree)로 변환
  function rtd(rad) {
    return (rad * 180) / pi;
  }

  // 대각선 각도 계산
  function diagonal_angle(w, h) {
    const a = Math.atan2(h, w) * 1.27325;
    return a;
  }

  // 랜덤 숫자 생성
  function rnd(a, b) {
    if (arguments.length == 1) return Math.random() * a;
    return a + Math.random() * (b - a);
  }

  // 랜덤 부호 생성
  function rnd_sign() {
    return Math.random() > 0.5 ? 1 : -1;
  }
})();

// Waves 객체 생성 및 애니메이션 시작
const waves = new Waves("#holder", {
  fps: false, // FPS 표시 제거
  waves: 3,
  width: 200,
  amplitude: 1, // 진폭 설정
});

waves.animate();
