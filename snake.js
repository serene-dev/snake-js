#!/usr/bin/env node

const COLS = 60, ROWS = 30;
const out = process.stdout;

const snake = Array(1024);
let head, tail, dir, newdir, apple, gameover, key = null;

const init = () => {
  out.write('┌' + '─'.repeat(COLS) + '┐\n');
  out.write(('│' + '·'.repeat(COLS) + '│\n').repeat(ROWS));
  out.write('└' + '─'.repeat(COLS) + '┘\n');
  out.write(`\x1b[${ROWS + 2}F`);

  head = tail = 0;
  snake[head] = { x: COLS / 2, y: ROWS / 2 };
  dir = { x: 1, y: 0 };
  newdir = apple = null;
  gameover = false;
};

const printAt = ({x, y}, c) => {
  out.write(`\x1b[${y + 1}B\x1b[${x + 1}C${c}`);
  out.write(`\x1b[${y + 1}F`);
};

// Hide cursor
out.write('\x1b[?25l');
init();

const loop = setInterval(function() {
  if (gameover)
    return;
  if (!apple) {
    apple = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    for (let i = tail; apple && i != head; i = (i + 1) & 1023)
      if (snake[i].x == apple.x && snake[i].y == apple.y)
        apple = null;
    // Draw apple
    if (apple)
      printAt(apple, '❤');
  }

  // Clear snake tail
  printAt(snake[tail], '·');
  if (apple && snake[head].x == apple.x && snake[head].y == apple.y)
    apple = null;
  else
    tail = (tail + 1) & 1023;

  const old = snake[head];
  head = (head + 1) & 1023;
  if (newdir)
    dir = newdir;
  snake[head] = {
    x: (old.x + dir.x + COLS) % COLS,
    y: (old.y + dir.y + ROWS) % ROWS
  };
  for (let i = tail; i != head; i = (i + 1) & 1023)
    if (snake[i].x == snake[head].x && snake[i].y == snake[head].y) {
      printAt({ x: COLS / 2 - 5, y: ROWS / 2 }, " Game Over! ");
      gameover = true;
    }

  // Draw snake head
  printAt(snake[head], '▓');
}, 5 * 1000 / 60);

process.stdin.on('data', function(d) {
  const k = String.fromCharCode(d[0]);
  if (gameover)
    init();
  else if (k == 'q' || k == '\x1b') {
    // Quit
    clearInterval(loop);
    process.stdin.pause();
    // Show cursor
    out.write('\x1b[?25h');
  } else if (k == 'h' && dir.x != 1)
    newdir = { x: -1, y: 0 };
  else if (k == 'l' && dir.x != -1)
    newdir = { x: 1, y: 0 };
  else if (k == 'j' && dir.y != -1)
    newdir = { x: 0, y: 1 };
  else if (k == 'k' && dir.y != 1)
    newdir = { x: 0, y: -1 };
});

process.stdin.setRawMode(true);
process.stdin.resume();

