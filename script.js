<!DOCTYPE html><html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Flappy Bird</title>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
    <style>
        /* Styles are exactly as you provided and already optimized */
        /* ... (All CSS from your previous message can remain unchanged) ... */
    </style>
</head>
<body>
    <div class="container">
        <div id="authContainer">
            <h1>🐦 Flappy Bird</h1>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <div>
                <button onclick="login()">Login</button>
                <button onclick="register()">Register</button>
            </div>
        </div><div id="gameContainer" class="hidden">
        <div class="game-header">
            <span>Player: <span id="playerName"></span></span>
            <span>Score: <span id="score">0</span></span>
            <button onclick="logout()">Logout</button>
        </div>
        
        <canvas id="gameCanvas" width="400" height="600"></canvas>
        
        <div class="game-controls">
            <button id="startBtn" onclick="startGame()">Start Game</button>
        </div>
        
        <div class="instructions">
            <strong>Instructions:</strong> Tap anywhere on screen or press SPACE to flap. Avoid the pipes!
        </div>
        
        <div id="leaderboard">
            <h3>🏆 Top Scores</h3>
            <ul></ul>
        </div>
    </div>
</div>

<script>
    const firebaseConfig = {
        apiKey: "AIzaSyBp8i4NxEN4nkymuKz4VEmJed7j7MmC8ZM",
        authDomain: "floppy-bird-d3441.firebaseapp.com",
        projectId: "floppy-bird-d3441",
        storageBucket: "floppy-bird-d3441.appspot.com",
        messagingSenderId: "196211146547",
        appId: "1:196211146547:web:18c0db4cfc1255e0870846",
        measurementId: "G-VXNT14PN5Y"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    const authContainer = document.getElementById("authContainer");
    const gameContainer = document.getElementById("gameContainer");
    const playerNameSpan = document.getElementById("playerName");
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const scoreDisplay = document.getElementById("score");
    const startBtn = document.getElementById("startBtn");
    const leaderboard = document.getElementById("leaderboard").querySelector("ul");

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
        if (!email || !password) return alert("Enter email and password.");
        auth.signInWithEmailAndPassword(email, password).catch(err => alert(err.message));
    }

    function register() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        if (!email || !password) return alert("Enter email and password.");
        auth.createUserWithEmailAndPassword(email, password).catch(err => alert(err.message));
    }

    function logout() {
        auth.signOut();
    }

    let birdY = 300, birdV = 0, gravity = 0.4, jumpStrength = -7, score = 0;
    let pipes = [];
    let gameLoop, running = false;
    let pipeSpeed = 1.5, pipeGap = 150, pipeWidth = 50, pipeSpacing = 250;

    function startGame() {
        birdY = 300; birdV = 0; score = 0; pipes = [{ x: 500, y: Math.random() * 200 + 150 }];
        running = false; startBtn.disabled = true; scoreDisplay.innerText = "0";
        let count = 3;
        startBtn.innerText = `Starting in ${count}...`;
        const countdown = setInterval(() => {
            count--;
            if (count > 0) startBtn.innerText = `Starting in ${count}...`;
            else {
                clearInterval(countdown);
                startBtn.innerText = "Start Game";
                running = true;
                gameLoop = requestAnimationFrame(draw);
            }
        }, 1000);
    }

    canvas.addEventListener("touchstart", e => { e.preventDefault(); if (running) birdV = jumpStrength; });
    canvas.addEventListener("click", () => { if (running) birdV = jumpStrength; });
    document.addEventListener("keydown", e => { if ([" ", "ArrowUp"].includes(e.key)) { e.preventDefault(); if (running) birdV = jumpStrength; } });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        birdV += gravity; birdY += birdV;
        ctx.fillStyle = "#FFD700";
        ctx.strokeStyle = "#FF8C00";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(80, birdY, 15, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(85, birdY - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        for (let i = pipes.length - 1; i >= 0; i--) {
            let pipe = pipes[i]; pipe.x -= pipeSpeed;
            if (pipe.x + pipeWidth < 0) { pipes.splice(i, 1); continue; }
            if (pipe.x < canvas.width - pipeSpacing && pipes.length === 1) {
                pipes.push({ x: canvas.width, y: Math.random() * 200 + 150, scored: false });
            }
            const topHeight = pipe.y - pipeGap / 2;
            const bottomY = pipe.y + pipeGap / 2;
            const bottomHeight = canvas.height - bottomY;
            ctx.fillStyle = "#2e7d32";
            ctx.fillRect(pipe.x, 0, pipeWidth, topHeight);
            ctx.strokeRect(pipe.x, 0, pipeWidth, topHeight);
            ctx.fillRect(pipe.x, bottomY, pipeWidth, bottomHeight);
            ctx.strokeRect(pipe.x, bottomY, pipeWidth, bottomHeight);
            if (!pipe.scored && pipe.x + pipeWidth < 80) { score++; pipe.scored = true; scoreDisplay.innerText = score; }
            if (pipe.x < 95 && pipe.x + pipeWidth > 65 && (birdY - 15 < topHeight || birdY + 15 > bottomY)) {
                endGame(); return;
            }
        }
        if (birdY > canvas.height - 15 || birdY < 15) { endGame(); return; }
        if (pipes.length === 0) pipes.push({ x: canvas.width, y: Math.random() * 200 + 150, scored: false });
        gameLoop = requestAnimationFrame(draw);
    }

    function endGame() {
        cancelAnimationFrame(gameLoop); running = false; startBtn.disabled = false; startBtn.innerText = "Play Again";
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width/2, canvas.height/2 - 40);
        ctx.font = "20px Arial";
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2);
        ctx.font = "16px Arial";
        ctx.fillText("Tap 'Play Again' to restart", canvas.width/2, canvas.height/2 + 40);
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
        db.collection("flappyScores").orderBy("score", "desc").limit(5).get()
        .then(snapshot => {
            leaderboard.innerHTML = "";
            snapshot.forEach((doc, index) => {
                const data = doc.data();
                const li = document.createElement("li");
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅";
                li.innerText = `${medal} ${data.email}: ${data.score}`;
                leaderboard.appendChild(li);
            });
        });
    }
</script>

</body>
</html>
