let move_speed, gravity;
let game_state = 'Start';
let bird = document.querySelector('.bird');
let message = document.querySelector('.message');
let score_val = document.querySelector('.score_val');
let score_title = document.querySelector('.score_title');
let high_scores_el = document.querySelector('.high_scores');
let difficulty = document.getElementById('difficulty');

let score = 0, bird_dy = 0, pipe_separation = 0, pipe_gap = 30;
let background = document.querySelector('.background').getBoundingClientRect();

const setDifficulty = () => {
  switch (difficulty.value) {
    case 'easy': move_speed = 2; gravity = 0.4; break;
    case 'normal': move_speed = 3; gravity = 0.5; break;
    case 'hard': move_speed = 4; gravity = 0.6; break;
  }
};

difficulty.addEventListener('change', setDifficulty);
setDifficulty();

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && game_state !== 'Play') {
    document.querySelectorAll('.pipe_sprite').forEach(e => e.remove());
    bird.style.top = '40vh';
    score_val.innerHTML = '0';
    message.innerHTML = '';
    score = 0;
    game_state = 'Play';
    play();
  }
});

function play() {
  let bird_props = bird.getBoundingClientRect();

  function applyGravity() {
    if (game_state !== 'Play') return;

    bird_dy += gravity;
    bird.style.top = bird.offsetTop + bird_dy + 'px';
    bird_props = bird.getBoundingClientRect();

    if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
      endGame();
    }

    requestAnimationFrame(applyGravity);
  }

  function movePipes() {
    document.querySelectorAll('.pipe_sprite').forEach(pipe => {
      let pipe_props = pipe.getBoundingClientRect();
      pipe.style.left = pipe.offsetLeft - move_speed + 'px';

      if (
        pipe_props.right < bird_props.left &&
        pipe.increase_score === '1'
      ) {
        score++;
        pipe.increase_score = '0';
        score_val.innerHTML = score;
        if (score % 10 === 0) move_speed += 0.5;
      }

      if (isCollide(pipe_props, bird_props)) {
        endGame();
      }

      if (pipe_props.right <= 0) pipe.remove();
    });

    requestAnimationFrame(movePipes);
  }

  function isCollide(pipe, bird) {
    return !(
      bird.bottom < pipe.top ||
      bird.top > pipe.bottom ||
      bird.right < pipe.left ||
      bird.left > pipe.right
    );
  }

  function generatePipes() {
    if (game_state !== 'Play') return;
    pipe_separation++;
    if (pipe_separation > 100) {
      pipe_separation = 0;

      let pipe_pos = Math.floor(Math.random() * 45) + 5;

      let pipe_top = document.createElement('img');
      pipe_top.src = 'img/gf.png';
      pipe_top.className = 'pipe_sprite';
      pipe_top.style.top = (pipe_pos - 70) + 'vh';
      pipe_top.style.left = '100vw';

      let pipe_bottom = document.createElement('img');
      pipe_bottom.src = 'img/gf.png';
      pipe_bottom.className = 'pipe_sprite';
      pipe_bottom.style.top = (pipe_pos + pipe_gap) + 'vh';
      pipe_bottom.style.left = '100vw';
      pipe_bottom.increase_score = '1';

      document.body.appendChild(pipe_top);
      document.body.appendChild(pipe_bottom);
    }

    requestAnimationFrame(generatePipes);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === ' ') {
      bird_dy = -7.6;
    }
  });

  requestAnimationFrame(applyGravity);
  requestAnimationFrame(movePipes);
  requestAnimationFrame(generatePipes);
}

function endGame() {
  game_state = 'End';
  message.innerHTML = 'Fim de jogo! Pressione Enter para reiniciar';
  message.style.left = '50%';

  saveScore(score);
  showHighScores();
}

function saveScore(score) {
  let scores = JSON.parse(localStorage.getItem('flappy_scores')) || [];
  scores.push(score);
  scores.sort((a, b) => b - a);
  localStorage.setItem('flappy_scores', JSON.stringify(scores.slice(0, 5)));
}

function showHighScores() {
  let scores = JSON.parse(localStorage.getItem('flappy_scores')) || [];
  high_scores_el.innerHTML = "<strong>Top 5:</strong><br>" + scores.map((s, i) => `${i + 1}. ${s}`).join('<br>');
}