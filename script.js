const firebaseConfig = {
  apiKey: "AIzaSyBp8i4NxEN4nkymuKz4VEmJed7j7MmC8ZM",
  authDomain: "floppy-bird-d3441.firebaseapp.com",
  projectId: "floppy-bird-d3441",
  storageBucket: "floppy-bird-d3441.firebasestorage.app",
  messagingSenderId: "196211146547",
  appId: "1:196211146547:web:18c0db4cfc1255e0870846",
  measurementId: "G-VXNT14PN5Y"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM
const authContainer = document.getElementById("authContainer");
const gameContainer = document.getElementById("gameContainer");
const playerNameSpan = document.getElementById("playerName");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const leaderboard = document.getElementById("leaderboard");

auth.onAuthStateChanged(user => {
  if (user) {
    authContainer.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    playerNameSpan.innerText = user.email;
    loadLeaderboard();
  } else {
    authContainer.classList.remove("hidden");
    gameContainer.classList.add("hidden");
  }
});

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password).catch(alert);
}

function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password).catch(alert);
}

function logout() {
  auth.signOut();
}

// Game Logic
let birdY = 250, birdV = 0, gravity = 0.3, score = 0;
let pipes = [];
let gameLoop;
let running = false;

function startGame() {
  birdY = 250;
  birdV = 0;
  score = 0;
  pipes = [{ x: 300, y: Math.random() * 200 + 100 }];
  running = false;
  startBtn.disabled = true;
  scoreDisplay.innerText = "0";

  let count = 3;
  startBtn.innerText = `Starting in ${count}...`;

  const countdown = setInterval(() => {
    count--;
    if (count > 0) {
      startBtn.innerText = `Starting in ${count}...`;
    } else {
      clearInterval(countdown);
      startBtn.innerText = "Start Game";
      running = true;
      gameLoop = requestAnimationFrame(draw);
    }
  }, 1000);
}

document.addEventListener("touchstart", () => {
  if (running) birdV = -6;
});

document.addEventListener("keydown", e => {
  if (e.key === " " || e.key === "ArrowUp") {
    if (running) birdV = -6;
  }
});

function draw() {
  ctx.clearRect(0, 0, 300, 500);

  birdV += gravity;
  birdY += birdV;

  // Draw Bird
  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.arc(60, birdY, 10, 0, Math.PI * 2);
  ctx.fill();

  // Draw Pipes
  for (let pipe of pipes) {
    pipe.x -= 2;

    if (pipe.x + 40 < 0) {
      pipe.x = 300;
      pipe.y = Math.random() * 200 + 100;
      score++;
    }

    const gap = 100; // increased gap

    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(pipe.x, 0, 40, pipe.y - gap / 2);
    ctx.fillRect(pipe.x, pipe.y + gap / 2, 40, 500 - pipe.y);

    if (
      pipe.x < 70 &&
      pipe.x + 40 > 50 &&
      (birdY < pipe.y - gap / 2 || birdY > pipe.y + gap / 2)
    ) {
      endGame();
      return;
    }
  }

  if (birdY > 500 || birdY < 0) {
    endGame();
    return;
  }

  scoreDisplay.innerText = score;
  gameLoop = requestAnimationFrame(draw);
}

function endGame() {
  cancelAnimationFrame(gameLoop);
  running = false;
  startBtn.disabled = false;
  saveScore(score);
}

function saveScore(score) {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("flappyScores").add({
    email: user.email,
    score: score,
    timestamp: Date.now()
  }).then(loadLeaderboard);
}

function loadLeaderboard() {
  db.collection("flappyScores")
    .orderBy("score", "desc")
    .limit(5)
    .get()
    .then(snapshot => {
      leaderboard.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.innerText = `${data.email}: ${data.score}`;
        leaderboard.appendChild(li);
      });
    });
}
