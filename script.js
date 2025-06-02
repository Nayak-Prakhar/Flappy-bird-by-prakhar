// Firebase Config
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

let user;
auth.signInAnonymously().then(cred => {
  user = cred.user.uid;
});

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");

let birdY = 250, birdV = 0, gravity = 0.5, score = 0;
let pipes = [{ x: 300, y: Math.random() * 200 + 100 }];
let gameOver = false;

document.addEventListener("touchstart", flap);
document.addEventListener("keydown", e => {
  if (e.key === " " || e.key === "ArrowUp") flap();
});

function flap() {
  birdV = -7;
}

function draw() {
  if (gameOver) return;

  ctx.clearRect(0, 0, 300, 500);

  // Bird
  birdV += gravity;
  birdY += birdV;
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(60, birdY, 10, 0, Math.PI * 2);
  ctx.fill();

  // Pipes
  for (let pipe of pipes) {
    pipe.x -= 2;

    if (pipe.x + 40 < 0) {
      pipe.x = 300;
      pipe.y = Math.random() * 200 + 100;
      score++;
    }

    ctx.fillStyle = "green";
    ctx.fillRect(pipe.x, 0, 40, pipe.y - 60);
    ctx.fillRect(pipe.x, pipe.y + 60, 40, 500 - pipe.y);

    if (
      pipe.x < 70 &&
      pipe.x + 40 > 50 &&
      (birdY < pipe.y - 60 || birdY > pipe.y + 60)
    ) {
      endGame();
    }
  }

  if (birdY > 500 || birdY < 0) {
    endGame();
  }

  scoreDisplay.textContent = score;
  requestAnimationFrame(draw);
}

function endGame() {
  gameOver = true;
  saveScore();
}

function saveScore() {
  db.collection("flappyScores").add({
    uid: user,
    score: score,
    created: Date.now()
  }).then(loadLeaderboard);
}

function loadLeaderboard() {
  db.collection("flappyScores")
    .orderBy("score", "desc")
    .limit(5)
    .get()
    .then(snapshot => {
      const list = document.getElementById("leaderboard");
      list.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.innerText = `Score: ${data.score}`;
        list.appendChild(li);
      });
    });
}

draw();
