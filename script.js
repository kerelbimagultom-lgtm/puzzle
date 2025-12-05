// ===========================
// DATA LEVEL KLUB SEPAKBOLA
// ===========================
const CLUBS = [
  "Persik",         // 1
  "Persija",        // 2
  "PSS Sleman",     // 3
  "Persebaya",      // 4
  "Arema FC",       // 5
  "Bali United",    // 6
  "PSM Makassar",   // 7
  "Borneo FC",      // 8
  "Barito Putera",  // 9
  "PSIS Semarang",  //10
  "Persita",        //11
  "Persib",         //12
  "PS TIRA",        //13
  "Madura Utd",     //14
  "RANS Nus.",      //15
  "Dewa United",    //16
  "Persela",        //17
  "PSSU Medan",     //18
  "Sriwijaya",      //19
  "PSPS Riau",      //20
  "Persiba",        //21
  "Cilegon Utd",    //22
  "Semen Padang",   //23
  "PERSERU",        //24
  "Indonesia XI"    //25
];

const GRID_SIZE = 4; // 4x4 grid
const MAX_LEVEL = 25; // Club tertinggi, index ke-24 (level 25)
let board, hasMoved, newCellPositions, gameOver, victory, maxLevelThisGame;

// ==============
// DOM ELEMENTS
// ==============
const gridElem = document.getElementById('grid');
const maxLevelElem = document.getElementById('max-level');
const messageElem = document.getElementById('message');
const restartBtn = document.getElementById('restart');

// ==============
// SETUP GAME
// ==============
function createEmptyBoard() {
  let arr = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    arr[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      arr[y][x] = 0;
    }
  }
  return arr;
}

function startGame() {
  board = createEmptyBoard();
  // Indexed array to store which position is newly spawned
  newCellPositions = [];
  // Mulai dengan 2 tile acak
  addRandomTile();
  addRandomTile();
  maxLevelThisGame = 1;
  gameOver = false;
  victory = false;
  updateGrid();
  updateInfo();
  messageElem.textContent = '';
}

function addRandomTile() {
  // Cari sel kosong
  const empties = [];
  for(let y=0;y<GRID_SIZE;y++) {
    for(let x=0;x<GRID_SIZE;x++) {
      if (board[y][x] === 0) empties.push([y,x]);
    }
  }
  if (empties.length===0) return; // sudah penuh
  // Tambahkan tile "1" (level 1/klub awal)
  const [y,x] = empties[Math.floor(Math.random()*empties.length)];
  board[y][x] = 1;
  newCellPositions.push(`${y}_${x}`);
}

function updateGrid() {
  gridElem.innerHTML = '';
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let v = board[y][x];
      let cell = document.createElement('div');
      cell.className = "cell";
      if (v > 0) {
        cell.setAttribute("data-level", v);
        const label = `${CLUBS[v-1]}${v==MAX_LEVEL?' ⭐':''}`;
        cell.textContent = label;
        // animasi efek jika sel baru
        if (newCellPositions.includes(`${y}_${x}`)) {
          cell.classList.add('new');
        }
      } else {
        cell.textContent = '';
      }
      gridElem.appendChild(cell);
    }
  }
}

function updateInfo() {
  maxLevelElem.textContent = maxLevelThisGame;
  if (victory) {
    messageElem.textContent = `Selamat! Kamu membawa klub ke level tertinggi (${CLUBS[MAX_LEVEL-1]})! 🎉`;
  } else if (gameOver) {
    messageElem.textContent = "Game Over! Tak bisa digabung lagi.";
  } else {
    messageElem.textContent = "";
  }
}

// =================
// GAMEPLAY LOGIC
// =================

// get 'lines' by direction (up, down, left, right move)
function getLines(dir) {
  let lines = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    let oneLine = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      if (dir==='left') oneLine.push(board[i][j]);
      if (dir==='right') oneLine.push(board[i][GRID_SIZE-j-1]);
      if (dir==='up') oneLine.push(board[j][i]);
      if (dir==='down') oneLine.push(board[GRID_SIZE-j-1][i]);
    }
    lines.push(oneLine);
  }
  return lines;
}
function applyLinesToBoard(lines, dir) {
  for (let i = 0;i<GRID_SIZE;i++)
    for (let j=0;j<GRID_SIZE;j++){
      if (dir==='left')      board[i][j]=lines[i][j];
      if (dir==='right')     board[i][GRID_SIZE-j-1]=lines[i][j];
      if (dir==='up')        board[j][i]=lines[i][j];
      if (dir==='down')      board[GRID_SIZE-j-1][i]=lines[i][j];
    }
}

// proses Gabungan untuk satu baris
function combineLine(line) {
  // Gabung tile yang sama
  let newLine = line.filter(x=>x>0);
  for (let i=0;i<newLine.length-1;i++) {
    if (newLine[i] === newLine[i+1] && newLine[i]!==MAX_LEVEL) { // Hanya bisa digabung kalau belum puncak
      newLine[i]++;
      newLine[i+1]=0;
      if (newLine[i] > maxLevelThisGame) {
        maxLevelThisGame = newLine[i];
        if (newLine[i]===MAX_LEVEL) victory=true; // finish!
      }
    }
  }
  // Geser lagi setelah gabungan
  newLine = newLine.filter(x=>x>0);
  while (newLine.length<GRID_SIZE) newLine.push(0);
  return newLine;
}

function move(dir) {
  if (gameOver||victory) return;
  let moved = false;
  newCellPositions = [];
  let prevBoard = JSON.stringify(board);

  let lines = getLines(dir);
  let newLines = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    let curLine = lines[i];
    let postCombine = combineLine(curLine);
    newLines.push(postCombine);
  }
  applyLinesToBoard(newLines, dir);
  if(prevBoard!=JSON.stringify(board)) moved = true;
  if (moved) {
    addRandomTile();
    updateGrid();
    updateInfo();
    if(!canMove() && !victory){
      gameOver = true;
      updateInfo();
    }
  }
}

function canMove() {
  // Masih ada sel kosong?
  for (let y=0;y<GRID_SIZE;y++)
    for (let x=0;x<GRID_SIZE;x++)
      if (board[y][x]===0) return true;
  // Bisa digabung?
  for(let y=0;y<GRID_SIZE;y++) for(let x=0;x<GRID_SIZE;x++){
    let v=board[y][x];
    if(y>0 && v === board[y-1][x]) return true;
    if(y<GRID_SIZE-1 && v === board[y+1][x]) return true;
    if(x>0 && v === board[y][x-1]) return true;
    if(x<GRID_SIZE-1 && v === board[y][x+1]) return true;
  }
  return false;
}

// ==============
// EVENT HANDLER
// ==============
document.addEventListener('keydown', function(e){
  if(e.key==="ArrowLeft")  move('left');
  if(e.key==="ArrowRight") move('right');
  if(e.key==="ArrowUp")    move('up');
  if(e.key==="ArrowDown")  move('down');
});
// tombol arrow untuk hp
document.querySelectorAll('#btn-arrows button').forEach(btn=>{
  btn.onclick = ()=>move(btn.dataset.dir);
});

// restart
restartBtn.onclick = () => startGame();

startGame();
