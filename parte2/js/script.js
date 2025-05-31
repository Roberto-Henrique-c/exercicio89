document.addEventListener("DOMContentLoaded", () => {
  const playerNameForm = document.getElementById("playerNameForm");
  const playerNameInput = document.getElementById("playerNameInput");
  const displayPlayerName = document.getElementById("displayPlayerName");
  const winnerName = document.getElementById("winnerName");
  const finalScore = document.getElementById("finalScore");
  const highScoresList = document.getElementById("highScoresList");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const message = document.getElementById("message");
  const gameBoard = document.getElementById("gameBoard");

  const playerNameScreen = document.getElementById("playerNameScreen");
  const difficultyScreen = document.getElementById("difficultyScreen");
  const gameScreen = document.getElementById("gameScreen");
  const victoryScreen = document.getElementById("victoryScreen");

  const playAgainBtn = document.getElementById("playAgainBtn");
  const difficultyButtons = document.querySelectorAll("#difficultyButtons button");

  let playerName = "";
  let difficulty = "easy";
  let gridSize = 4;
  let totalCards = 16;
  let score = 0;
  let firstCard = null;
  let lockBoard = false;
  let matchedPairs = 0;

  // --- Imagens únicas (URL de exemplo de placeholder, substitua pela API ou local)
  const generateImageURLs = (count) => {
    return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${Math.random()}/100`);
  };

  // --- Criação das cartas
  function createCards() {
    gameBoard.innerHTML = "";
    gameBoard.className = ""; // Resetar classes anteriores
    const imageCount = (gridSize * gridSize) / 2;
    const images = generateImageURLs(imageCount);
    const cardsData = [...images, ...images] // Criar pares
      .sort(() => 0.5 - Math.random()) // Embaralhar

    cardsData.forEach((imgSrc, index) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.image = imgSrc;
      card.setAttribute("aria-label", "Carta de memória");

      card.innerHTML = `
        <div class="card-inner" style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.5s;">
          <div class="card-front" style="position: absolute; backface-visibility: hidden; width: 100%; height: 100%; background-color: #bdc3c7; border-radius: 10px;"></div>
          <div class="card-back" style="position: absolute; backface-visibility: hidden; width: 100%; height: 100%; transform: rotateY(180deg); background-image: url('${imgSrc}'); background-size: cover; border-radius: 10px;"></div>
        </div>
      `;

      card.addEventListener("click", () => flipCard(card));
      gameBoard.appendChild(card);
    });

    gameBoard.classList.add(`grid-${difficulty}`);
  }

  // --- Virar carta
  function flipCard(card) {
    if (lockBoard || card === firstCard || card.classList.contains("matched")) return;

    const inner = card.querySelector(".card-inner");
    inner.style.transform = "rotateY(180deg)";
    card.classList.add("flipped");

    if (!firstCard) {
      firstCard = card;
      return;
    }

    const secondCard = card;
    lockBoard = true;

    const img1 = firstCard.dataset.image;
    const img2 = secondCard.dataset.image;

    if (img1 === img2) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      score += 5;
      matchedPairs++;
      message.textContent = "Par encontrado!";
      checkVictory();
    } else {
      score -= 3;
      message.textContent = "Não combinou!";
      setTimeout(() => {
        firstCard.querySelector(".card-inner").style.transform = "rotateY(0deg)";
        secondCard.querySelector(".card-inner").style.transform = "rotateY(0deg)";
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
      }, 1000);
    }

    updateScore();
    firstCard = null;
    lockBoard = false;
  }

  function updateScore() {
    scoreDisplay.textContent = `Pontuação: ${score}`;
  }

  function checkVictory() {
    if (matchedPairs === totalCards / 2) {
      setTimeout(() => {
        showVictoryScreen();
        saveHighScore();
      }, 1000);
    }
  }

  function showVictoryScreen() {
    gameScreen.classList.remove("active");
    gameScreen.setAttribute("aria-hidden", "true");
    victoryScreen.classList.add("active");
    victoryScreen.setAttribute("aria-hidden", "false");
    winnerName.textContent = playerName;
    finalScore.textContent = score;
    loadHighScores();
  }

  function saveHighScore() {
    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    highScores.push({ name: playerName, score });
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem("highScores", JSON.stringify(highScores.slice(0, 5)));
  }

  function loadHighScores() {
    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    highScoresList.innerHTML = "";
    highScores.forEach(({ name, score }) => {
      const li = document.createElement("li");
      li.textContent = `${name}: ${score} pontos`;
      highScoresList.appendChild(li);
    });
  }

  function resetGame() {
    firstCard = null;
    lockBoard = false;
    matchedPairs = 0;
    score = 0;
    updateScore();
    message.textContent = "";
  }

  // --- Eventos
  playerNameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    playerName = playerNameInput.value.trim();
    if (!playerName) return;
    displayPlayerName.textContent = playerName;
    playerNameScreen.classList.remove("active");
    difficultyScreen.classList.add("active");
    difficultyScreen.setAttribute("aria-hidden", "false");
  });

  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      difficulty = button.dataset.difficulty;
      gridSize = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;
      totalCards = gridSize * gridSize;

      difficultyScreen.classList.remove("active");
      gameScreen.classList.add("active");
      gameScreen.setAttribute("aria-hidden", "false");

      resetGame();
      createCards();
    });
  });

  playAgainBtn.addEventListener("click", () => {
    victoryScreen.classList.remove("active");
    difficultyScreen.classList.add("active");
    difficultyScreen.setAttribute("aria-hidden", "false");
  });
});
m