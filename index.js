(function () {
  // Inicia uma função anônima autoexecutável
  var isStart = false; // Variável para controlar se o jogo foi iniciado
  var tetris = {
    // Objeto Tetris que contém todas as propriedades e métodos do jogo
    board: [], // Array representando o tabuleiro do Tetris
    boardDiv: null, // Div do tabuleiro (comentado por razões de depuração)
    canvas: null, // Elemento do canvas onde o jogo será renderizado
    pSize: 20, // Tamanho de cada bloco do Tetris
    canvasHeight: 440, // Altura do canvas
    canvasWidth: 200, // Largura do canvas
    boardHeight: 0, // Altura do tabuleiro
    boardWidth: 0, // Largura do tabuleiro
    spawnX: 4, // Posição X inicial da peça
    spawnY: 1, // Posição Y inicial da peça
    shapes: [
      // Matriz de formas Tetris
      [
        [-1, 1],
        [0, 1],
        [1, 1],
        [0, 0], //TEE
      ],
      [
        [-1, 0],
        [0, 0],
        [1, 0],
        [2, 0], //linha
      ],
      [
        [-1, -1],
        [-1, 0],
        [0, 0],
        [1, 0], //L EL
      ],
      [
        [1, -1],
        [-1, 0],
        [0, 0],
        [1, 0], //R EL
      ],
      [
        [0, -1],
        [1, -1],
        [-1, 0],
        [0, 0], // R ess
      ],
      [
        [-1, -1],
        [0, -1],
        [0, 0],
        [1, 0], //L ess
      ],
      [
        [0, -1],
        [1, -1],
        [0, 0],
        [1, 0], //quadrdo
      ],
    ],
    tempShapes: null, // Lista temporária de formas
    curShape: null, // Forma atual em jogo
    curShapeIndex: null, // Índice da forma atual
    curX: 0, // Posição X da forma atual no tabuleiro
    curY: 0, // Posição Y da forma atual no tabuleiro
    curSqs: [], // Lista de quadrados da forma atual
    nextShape: null, // Próxima forma a entrar no jogo
    nextShapeDisplay: null, // Elemento que exibe a próxima forma
    nextShapeIndex: null, // Índice da próxima forma
    sqs: [], // Lista de todos os quadrados no tabuleiro
    score: 0, // Pontuação do jogador
    scoreDisplay: null, // Elemento que exibe a pontuação
    level: 1, // Nível atual do jogador
    levelDisplay: null, // Elemento que exibe o nível
    numLevels: 10, // Número total de níveis
    time: 0, // Tempo decorrido no jogo
    maxTime: 1000, // Tempo máximo permitido
    timeDisplay: null, // Elemento que exibe o tempo
    isActive: 0, // Flag indicando se o jogo está ativo
    curComplete: false, // Flag indicando se a forma atual está completa
    timer: null, // Temporizador principal do jogo
    sTimer: null, // Temporizador secundário
    speed: 700, // Velocidade inicial do jogo
    lines: 0, // Número de linhas eliminadas
    init: function () {
      // Método de inicialização do jogo
      isStart = true; // Marca o jogo como iniciado
      this.canvas = document.getElementById("canvas"); // Obtém o elemento do canvas
      this.initBoard(); // Inicializa o tabuleiro do Tetris
      this.initInfo(); // Inicializa as informações do jogo (pontuação, nível, etc.)
      this.initLevelScores(); // Inicializa os escores de nível
      this.initShapes(); // Inicializa as formas do Tetris
      this.bindKeyEvents(); // Adiciona manipuladores de eventos para as teclas
      this.play(); // Inicia o loop principal do jogo
    },
    initBoard: function () {
      this.boardHeight = this.canvasHeight / this.pSize; // Calcula a altura do tabuleiro em blocos
      this.boardWidth = this.canvasWidth / this.pSize; // Calcula a largura do tabuleiro em blocos
      var s = this.boardHeight * this.boardWidth;
      for (var i = 0; i < s; i++) {
        this.board.push(0);
      }
      //this.boardDiv = document.getElementById('board); //for debugging
    },
    initInfo: function () {
      // Inicializa as informações do jogo
      this.nextShapeDisplay = document.getElementById("next_shape"); // Elemento que exibe a próxima forma
      this.levelDisplay = document
        .getElementById("level")
        .getElementsByTagName("span")[0]; // Elemento que exibe o nível
      this.timeDisplay = document
        .getElementById("time")
        .getElementsByTagName("span")[0]; // Elemento que exibe o tempo
      this.scoreDisplay = document
        .getElementById("score")
        .getElementsByTagName("span")[0]; // Elemento que exibe a pontuação
      this.linesDisplay = document
        .getElementById("lines")
        .getElementsByTagName("span")[0]; // Elemento que exibe o número de linhas
      this.setInfo("time"); // Define a informação do tempo
      this.setInfo("score"); // Define a informação da pontuação
      this.setInfo("level"); // Define a informação do nível
      this.setInfo("lines"); // Define a informação do número de linhas
    },
    initShapes: function () {
      // Inicializa as formas do Tetris
      this.curSqs = []; // Lista de quadrados da forma atual
      this.curComplete = false; // Flag indicando se a forma atual está completa
      this.shiftTempShapes(); // Desloca as formas temporárias
      this.curShapeIndex = this.tempShapes[0]; // Obtém o índice da forma atual
      this.curShape = this.shapes[this.curShapeIndex]; // Obtém a forma atual
      this.initNextShape(); // Inicializa a próxima forma
      this.setCurCoords(this.spawnX, this.spawnY); // Define as coordenadas da forma atual
      this.drawShape(this.curX, this.curY, this.curShape); // Desenha a forma atual no canvas
    },
    initNextShape: function () {
      // Inicializa a próxima forma a entrar no jogo
      if (typeof this.tempShapes[1] === "undefined") {
        this.initTempShapes(); // Inicializa as formas temporárias se necessário
      }
      try {
        this.nextShapeIndex = this.tempShapes[1]; // Obtém o índice da próxima forma
        this.nextShape = this.shapes[this.nextShapeIndex]; // Obtém a próxima forma
        this.drawNextShape(); // Desenha a próxima forma no elemento de exibição
      } catch (e) {
        throw new Error("Could not create next shape. " + e); // Lança um erro se não for possível criar a próxima forma
      }
    },
    initTempShapes: function () {
      // Inicializa as formas temporárias
      this.tempShapes = [];
      for (var i = 0; i < this.shapes.length; i++) {
        this.tempShapes.push(i);
      }
      var k = this.tempShapes.length;
      while (--k) {
        // Algoritmo Fisher-Yates para embaralhar as formas temporárias
        var j = Math.floor(Math.random() * (k + 1));
        var tempk = this.tempShapes[k];
        var tempj = this.tempShapes[j];
        this.tempShapes[k] = tempj;
        this.tempShapes[j] = tempk;
      }
    },
    shiftTempShapes: function () {
      // Desloca as formas temporárias
      try {
        if (
          typeof this.tempShapes === "undefined" ||
          this.tempShapes === null
        ) {
          this.initTempShapes(); // Inicializa as formas temporárias se necessário
        } else {
          this.tempShapes.shift(); // Remove a forma atual da lista de formas temporárias
        }
      } catch (e) {
        throw new Error("Could not shift or init tempShapes: " + e); // Lança um erro se não for possível deslocar ou inicializar as formas temporárias
      }
    },
    initTimer: function () {
      // Inicializa o temporizador
      var me = this;
      var tLoop = function () {
        me.incTime(); // Incrementa o tempo
        me.timer = setTimeout(tLoop, 2000); // Configura um novo loop do temporizador após 2000 milissegundos (2 segundos)
      };
      this.timer = setTimeout(tLoop, 2000); // Inicia o loop do temporizador
    },
    initLevelScores: function () {
      // Inicializa os escores de nível
      var c = 1;
      for (var i = 1; i <= this.numLevels; i++) {
        this["level" + i] = [c * 1000, 40 * i, 5 * i]; // Define os escores para o próximo nível (pontuação para o próximo nível, pontuação por linha, pontuação por peça)
        c = c + c; // Dobra a pontuação necessária para o próximo nível
      }
    },
    setInfo: function (el) {
      // Define as informações exibidas no jogo
      this[el + "Display"].innerHTML = this[el]; // Atualiza o conteúdo do elemento de exibição com a informação correspondente
    },
    drawNextShape: function () {
      // Desenha a próxima forma no elemento de exibição
      var ns = [];
      for (var i = 0; i < this.nextShape.length; i++) {
        // Para cada bloco na próxima forma
        ns[i] = this.createSquare(
          this.nextShape[i][0] + 2, // Adiciona uma margem à posição X
          this.nextShape[i][1] + 2, // Adiciona uma margem à posição Y
          this.nextShapeIndex // Índice da próxima forma
        );
      }
      this.nextShapeDisplay.innerHTML = ""; // Limpa o conteúdo do elemento de exibição da próxima forma
      for (var k = 0; k < ns.length; k++) {
        this.nextShapeDisplay.appendChild(ns[k]);
      }
    },
    drawShape: function (x, y, p) {
      for (var i = 0; i < p.length; i++) {
        var newX = p[i][0] + x;
        var newY = p[i][1] + y;
        this.curSqs[i] = this.createSquare(newX, newY, this.curShapeIndex);
      }
      for (var k = 0; k < this.curSqs.length; k++) {
        this.canvas.appendChild(this.curSqs[k]);
      }
    },
    createSquare: function (x, y, type) {
      var el = document.createElement("div");
      el.className = "square type" + type;
      el.style.left = x * this.pSize + "px";
      el.style.top = y * this.pSize + "px";
      return el;
    },
    removeCur: function () {
      var me = this;
      this.curSqs.eachdo(function () {
        me.canvas.removeChild(this);
      });
      this.curSqs = [];
    },
    setCurCoords: function (x, y) {
      this.curX = x;
      this.curY = y;
    },
    bindKeyEvents: function () {
      var me = this;
      var event = "keypress";
      if (this.isSafari() || this.isIE()) {
        event = "keydown";
      }
      var cb = function (e) {
        me.handleKey(e);
      };
      if (window.addEventListener) {
        document.addEventListener(event, cb, false);
      } else {
        document.attachEvent("on" + event, cb);
      }
    },
    handleKey: function (e) {
      var c = this.whichKey(e);
      var dir = "";
      switch (c) {
        // identifica o botao apertado e executa o comando
        case 37: //seta da esquerda
          this.move("L");
          break;
        case 65: // A
          this.move("L");
          break;
        case 38: //seta para cima
          this.move("RT");
          break;
        case 87: // W
          this.move("RT");
          break;
        case 39: //seta da direita
          this.move("R");
          break;
        case 68: // D
          this.move("R");
          break;
        case 40: //seta para baixo
          this.move("D");
          break;
        case 83: // S
          this.move("D");
          break;
        case 27: //esc: pause
          this.togglePause();
          break;
        default:
          break;
      }
    },
    whichKey: function (e) {
      var c;
      if (window.event) {
        c = window.event.keyCode;
      } else if (e) {
        c = e.keyCode;
      }
      return c;
    },
    incTime: function () {
      this.time++;
      this.setInfo("time");
    },
    incScore: function (amount) {
      this.score = this.score + amount;
      this.setInfo("score");
    },
    incLevel: function () {
      this.level++;
      this.speed = this.speed - 75;
      this.setInfo("level");
    },
    incLines: function (num) {
      this.lines += num;
      this.setInfo("lines");
    },
    calcScore: function (args) {
      var lines = args.lines || 0;
      var shape = args.shape || false;
      var speed = args.speed || 0;
      var score = 0;

      if (lines > 0) {
        score += lines * this["level" + this.level][1];
        this.incLines(lines);
      }
      if (shape === true) {
        score += shape * this["level" + this.level][2];
      }
      /*if (speed > 0){ score += speed * this["level" +this .level[3]];}*/
      this.incScore(score);
    },
    checkScore: function () {
      if (this.score >= this["level" + this.level][0]) {
        this.incLevel();
      }
    },
    gameOver: function () {
      this.clearTimers();
      isStart = false;
      this.canvas.innerHTML = "<h1>GAME OVER</h1>";
      this.updateBestDisplay(); // Adicione esta linha
    },
    play: function () {
      var me = this;
      if (this.timer === null) {
        this.initTimer();
      }
      var gameLoop = function () {
        me.move("D");
        if (me.curComplete) {
          me.markBoardShape(me.curX, me.curY, me.curShape);
          me.curSqs.eachdo(function () {
            me.sqs.push(this);
          });
          me.calcScore({ shape: true });
          me.checkRows();
          me.checkScore();
          me.initShapes();
          me.play();
        } else {
          me.pTimer = setTimeout(gameLoop, me.speed);
        }
      };
      this.pTimer = setTimeout(gameLoop, me.speed);
      this.isActive = 1;
    },
    togglePause: function () {
      if (this.isActive === 1) {
        this.clearTimers();
        this.isActive = 0;
      } else {
        this.play();
      }
    },
    clearTimers: function () {
      clearTimeout(this.timer);
      clearTimeout(this.pTimer);
      this.timer = null;
      this.pTimer = null;
    },
    move: function (dir) {
      var s = "";
      var me = this;
      var tempX = this.curX;
      var tempY = this.curY;
      switch (dir) {
        case "L":
          s = "left";
          tempX -= 1;
          break;
        case "R":
          s = "left";
          tempX += 1;
          break;
        case "D":
          s = "top";
          tempY += 1;
          break;
        case "RT":
          this.rotate();
          return true;
          break;
        default:
          throw new Error("wtf");
          break;
      }
      if (this.checkMove(tempX, tempY, this.curShape)) {
        this.curSqs.eachdo(function (i) {
          var l = parseInt(this.style[s], 10);
          dir === "L" ? (l -= me.pSize) : (l += me.pSize);
          this.style[s] = l + "px";
        });
        this.curX = tempX;
        this.curY = tempY;
      } else if (dir === "D") {
        if (this.curY === 1 || this.time === this.maxTime) {
          this.gameOver();
          return false;
        }
        this.curComplete = true;
      }
    },
    rotate: function () {
      if (this.curShapeIndex !== 6) {
        //square
        var temp = [];
        this.curShape.eachdo(function () {
          temp.push([this[1] * -1, this[0]]);
        });
        if (this.checkMove(this.curX, this.curY, temp)) {
          this.curShape = temp;
          this.removeCur();
          this.drawShape(this.curX, this.curY, this.curShape);
        } else {
          throw new Error("Could not rotate!");
        }
      }
    },
    checkMove: function (x, y, p) {
      if (this.isOB(x, y, p) || this.isCollision(x, y, p)) {
        return false;
      }
      return true;
    },
    isCollision: function (x, y, p) {
      var me = this;
      var bool = false;
      p.eachdo(function () {
        var newX = this[0] + x;
        var newY = this[1] + y;
        if (me.boardPos(newX, newY) === 1) {
          bool = true;
        }
      });
      return bool;
    },
    isOB: function (x, y, p) {
      var w = this.boardWidth - 1;
      var h = this.boardHeight - 1;
      var bool = false;
      p.eachdo(function () {
        var newX = this[0] + x;
        var newY = this[1] + y;
        if (newX < 0 || newX > w || newY < 0 || newY > h) {
          bool = true;
        }
      });
      return bool;
    },
    getRowState: function (y) {
      var c = 0;
      for (var x = 0; x < this.boardWidth; x++) {
        if (this.boardPos(x, y) === 1) {
          c = c + 1;
        }
      }
      if (c === 0) {
        return "E";
      }
      if (c === this.boardWidth) {
        return "F";
      }
      return "U";
    },
    checkRows: function () {
      var me = this;
      var start = this.boardHeight;
      this.curShape.eachdo(function () {
        var n = this[1] + me.curY;
        console.log(n);
        if (n < start) {
          start = n;
        }
      });
      console.log(start);

      var c = 0;
      var stopCheck = false;
      for (var y = this.boardHeight - 1; y >= 0; y--) {
        switch (this.getRowState(y)) {
          case "F":
            this.removeRow(y);
            c++;
            break;
          case "E":
            if (c === 0) {
              stopCheck = true;
            }
            break;
          case "U":
            if (c > 0) {
              this.shiftRow(y, c);
            }
            break;
          default:
            break;
        }
        if (stopCheck === true) {
          break;
        }
      }
      if (c > 0) {
        this.calcScore({ lines: c });
      }
    },
    shiftRow: function (y, amount) {
      var me = this;
      for (var x = 0; x < this.boardWidth; x++) {
        this.sqs.eachdo(function () {
          if (me.isAt(x, y, this)) {
            me.setBlock(x, y + amount, this);
          }
        });
      }
      me.emptyBoardRow(y);
    },
    emptyBoardRow: function (y) {
      for (var x = 0; x < this.boardWidth; x++) {
        this.markBoardAt(x, y, 0);
      }
    },
    removeRow: function (y) {
      for (var x = 0; x < this.boardWidth; x++) {
        this.removeBlock(x, y);
      }
    },
    removeBlock: function (x, y) {
      var me = this;
      this.markBoardAt(x, y, 0);
      this.sqs.eachdo(function (i) {
        if (me.getPos(this)[0] === x && me.getPos(this)[1] === y) {
          me.canvas.removeChild(this);
          me.sqs.splice(i, 1);
        }
      });
    },
    setBlock: function (x, y, block) {
      this.markBoardAt(x, y, 1);
      var newX = x * this.pSize;
      var newY = y * this.pSize;
      block.style.left = newX + "px";
      block.style.top = newY + "px";
    },
    isAt: function (x, y, block) {
      if (this.getPos(block)[0] === x && this.getPos(block)[1] === y) {
        return true;
      }
      return false;
    },
    getPos: function (block) {
      var p = [];
      p.push(parseInt(block.style.left, 10) / this.pSize);
      p.push(parseInt(block.style.top, 10) / this.pSize);
      return p;
    },
    getBoardIdx: function (x, y) {
      return x + y * this.boardWidth;
    },
    boardPos: function (x, y) {
      return this.board[x + y * this.boardWidth];
    },
    markBoardAt: function (x, y, val) {
      this.board[this.getBoardIdx(x, y)] = val;
    },
    markBoardShape: function (x, y, p) {
      var me = this;
      p.eachdo(function (i) {
        var newX = p[i][0] + x;
        var newY = p[i][1] + y;
        me.markBoardAt(newX, newY, 1);
      });
    },
    isIE: function () {
      return this.bTest(/IE/);
    },
    isFirefox: function () {
      return this.bTest(/Firefox/);
    },
    isSafari: function () {
      return this.bTest(/Safari/);
    },
    bTest: function (rgx) {
      return rgx.test(navigator.userAgent);
    },
  };
  const btn = document.querySelector("#start");
  btn.addEventListener("click", function () {
    // Adiciona um ouvinte de evento de clique ao botão de início
    btn.style.display = "none"; // Esconde o botão de início
    if (!isStart) {
      tetris.init(); // Inicia o jogo se ainda não tiver sido iniciado
    }
  });
})();

if (!Array.prototype.eachdo) {
  Array.prototype.eachdo = function (fn) {
    for (var i = 0; i < this.length; i++) {
      fn.call(this[i], i);
    }
  };
}
if (!Array.prototype.remDup) {
  Array.prototype.remDup = function () {
    var temp = [];
    for (var i = 0; i < this.length; i++) {
      var bool = true;
      for (var j = i + 1; j < this.length; j++) {
        if (this[i] === this[j]) {
          bool = false;
        }
      }
      if (bool === true) {
        temp.push(this[i]);
      }
    }
    return temp;
  };
}

//botao de musica
const audio = document.getElementById("myAudio");
function startAudio() {
  audio.play();
}
function toggleAudio() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    toggleAudio();
  }
});
function toggleMute() {
  audio.muted = !audio.muted;
}