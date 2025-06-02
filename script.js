<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Flappy Bird</title>
    <script type="module">
        // Import Firebase v9+ modules
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
        import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
        import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
        import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js';
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #87CEEB, #98FB98);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .container {
            text-align: center;
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .hidden {
            display: none !important;
        }
        
        #authContainer {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            max-width: 350px;
            width: 90%;
        }
        
        h1 {
            color: #2e7d32;
            margin-bottom: 20px;
            font-size: 2.5em;
        }
        
        input {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
        }
        
        input:focus {
            outline: none;
            border-color: #2e7d32;
        }
        
        button {
            background: #2e7d32;
            color: white;
            border: none;
            padding: 12px 20px;
            margin: 5px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        
        button:hover {
            background: #1b5e20;
        }
        
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        #gameContainer {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100vh;
            padding: 10px;
        }
        
        .game-header {
            background: rgba(255,255,255,0.9);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            max-width: 400px;
        }
        
        #gameCanvas {
            border: 3px solid #2e7d32;
            border-radius: 10px;
            background: linear-gradient(180deg, #87CEEB 0%, #98FB98 100%);
            display: block;
            width: 100%;
            max-width: 400px;
            height: 600px;
            max-height: 70vh;
        }
        
        .game-controls {
            margin-top: 15px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        #leaderboard {
            background: rgba(255,255,255,0.9);
            border-radius: 10px;
            padding: 15px;
            margin-top: 15px;
            max-width: 400px;
            width: 100%;
        }
        
        #leaderboard h3 {
            color: #2e7d32;
            margin-bottom: 10px;
        }
        
        #leaderboard ul {
            list-style: none;
        }
        
        #leaderboard li {
            padding: 5px;
            background: #f5f5f5;
            margin: 3px 0;
            border-radius: 5px;
        }
        
        .instructions {
            background: rgba(255,255,255,0.9);
            padding: 15px;
            border-radius: 10px;
            margin-top: 10px;
            max-width: 400px;
            width: 100%;
            font-size: 14px;
            color: #333;
        }
        
        @media (max-width: 480px) {
            .game-header {
                font-size: 14px;
                padding: 10px;
            }
            
            #gameCanvas {
                height: 500px;
            }
            
            button {
                padding: 15px 25px;
                font-size: 18px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="authContainer">
            <h1>🐦 Flappy Bird</h1>
            <form id="authForm" onsubmit="handleSubmit(event)">
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Password (min 6 chars)" required minlength="6">
                <div>
                    <button type="button" onclick="login()">Login</button>
                    <button type="button" onclick="register()">Register</button>
                </div>
                <div style="margin-top: 15px; font-size: 12px; color: #666;">
                    <p>Demo: Use any email format (test@example.com) and password (minimum 6 characters)</p>
                </div>
            </form>
        </div>

        <div id="gameContainer" class="hidden">
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
            storageBucket: "floppy-bird-d3441.firebasestorage.app",
            messagingSenderId: "196211146547",
            appId: "1:196211146547:web:18c0db4cfc1255e0870846",
            measurementId: "G-VXNT14PN5Y"
        };

        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();

        // DOM Elements
        const authContainer = document.getElementById("authContainer");
        const gameContainer = document.getElementById("gameContainer");
        const playerNameSpan = document.getElementById("playerName");
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const scoreDisplay = document.getElementById("score");
        const startBtn = document.getElementById("startBtn");
        const leaderboard = document.getElementById("leaderboard").querySelector("ul");

        // Authentication with better error handling
        auth.onAuthStateChanged(user => {
            console.log("Auth state changed:", user ? "User logged in" : "User logged out");
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

        // Handle form submission
        function handleSubmit(event) {
            event.preventDefault();
            return false;
        }

        function login() {
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            
            if (!email || !password) {
                alert("Please enter both email and password");
                return;
            }
            
            // Show loading state
            const loginBtn = event.target;
            loginBtn.disabled = true;
            loginBtn.textContent = "Logging in...";
            
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    console.log("Login successful");
                })
                .catch(err => {
                    console.error("Login error:", err);
                    alert(`Login failed: ${err.message}`);
                })
                .finally(() => {
                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";
                });
        }

        function register() {
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            
            if (!email || !password) {
                alert("Please enter both email and password");
                return;
            }
            
            if (password.length < 6) {
                alert("Password must be at least 6 characters long");
                return;
            }
            
            // Show loading state
            const registerBtn = event.target;
            registerBtn.disabled = true;
            registerBtn.textContent = "Registering...";
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(() => {
                    console.log("Registration successful");
                    alert("Account created successfully!");
                })
                .catch(err => {
                    console.error("Registration error:", err);
                    alert(`Registration failed: ${err.message}`);
                })
                .finally(() => {
                    registerBtn.disabled = false;
                    registerBtn.textContent = "Register";
                });
        }

        function logout() {
            auth.signOut();
        }

        // Game Variables (Improved for better gameplay)
        let birdY = 300;
        let birdV = 0;
        let gravity = 0.4;
        let jumpStrength = -7;
        let score = 0;
        let pipes = [];
        let gameLoop;
        let running = false;
        let gameStarted = false;
        let pipeSpeed = 1.5; // Slower pipe movement
        let pipeGap = 150; // Larger gap for easier gameplay
        let pipeWidth = 50;
        let pipeSpacing = 250; // Distance between pipes
        let lastTime = 0;


            }, 1000);
        }

        // Touch and keyboard controls
        canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (running) birdV = jumpStrength;
        });

        canvas.addEventListener("click", () => {
            if (running) birdV = jumpStrength;
        });

        document.addEventListener("keydown", e => {
            if (e.key === " " || e.key === "ArrowUp") {
                e.preventDefault();
                if (running) birdV = jumpStrength;
            }
        });

        function draw() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update bird physics
            birdV += gravity;
            birdY += birdV;

            // Draw bird with better graphics
            ctx.fillStyle = "#FFD700";
            ctx.strokeStyle = "#FF8C00";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(80, birdY, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Bird eye
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(85, birdY - 5, 3, 0, Math.PI * 2);
            ctx.fill();

            // Update and draw pipes
            for (let i = pipes.length - 1; i >= 0; i--) {
                let pipe = pipes[i];
                pipe.x -= pipeSpeed;

                // Remove pipes that are off screen and add score
                if (pipe.x + pipeWidth < 0) {
                    pipes.splice(i, 1);
                    continue;
                }

                // Add new pipe when previous pipe is far enough
                if (pipe.x < canvas.width - pipeSpacing && pipes.length === 1) {
                    pipes.push({ 
                        x: canvas.width, 
                        y: Math.random() * 200 + 150,
                        scored: false 
                    });
                }

                // Draw pipes with better graphics
                const topHeight = pipe.y - pipeGap / 2;
                const bottomY = pipe.y + pipeGap / 2;
                const bottomHeight = canvas.height - bottomY;

                // Top pipe
                ctx.fillStyle = "#2e7d32";
                ctx.fillRect(pipe.x, 0, pipeWidth, topHeight);
                ctx.strokeStyle = "#1b5e20";
                ctx.lineWidth = 2;
                ctx.strokeRect(pipe.x, 0, pipeWidth, topHeight);

                // Bottom pipe
                ctx.fillRect(pipe.x, bottomY, pipeWidth, bottomHeight);
                ctx.strokeRect(pipe.x, bottomY, pipeWidth, bottomHeight);

                // Check for scoring (bird passes pipe)
                if (!pipe.scored && pipe.x + pipeWidth < 80) {
                    score++;
                    pipe.scored = true;
                    scoreDisplay.innerText = score;
                }

                // Collision detection
                if (pipe.x < 95 && pipe.x + pipeWidth > 65) {
                    if (birdY - 15 < topHeight || birdY + 15 > bottomY) {
                        endGame();
                        return;
                    }
                }
            }

            // Check for ground/ceiling collision
            if (birdY > canvas.height - 15 || birdY < 15) {
                endGame();
                return;
            }

            // Add more pipes as needed
            if (pipes.length === 0) {
                pipes.push({ 
                    x: canvas.width, 
                    y: Math.random() * 200 + 150,
                    scored: false 
                });
            }

            gameLoop = requestAnimationFrame(draw);
        }

        function endGame() {
            cancelAnimationFrame(gameLoop);
            running = false;
            startBtn.disabled = false;
            startBtn.innerText = "Play Again";
            
            // Show game over message
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
            db.collection("flappyScores")
                .orderBy("score", "desc")
                .limit(5)
                .get()
                .then(snapshot => {
                    leaderboard.innerHTML = "";
                    if (snapshot.empty) {
                        const li = document.createElement("li");
                        li.innerText = "No scores yet. Be the first!";
                        leaderboard.appendChild(li);
                        return;
                    }
                    
                    snapshot.forEach((doc, index) => {
                        const data = doc.data();
                        const li = document.createElement("li");
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅";
                        li.innerText = `${medal} ${data.email}: ${data.score}`;
                        leaderboard.appendChild(li);
                    });
                })
                .catch(err => {
                    console.error("Error loading leaderboard:", err);
                    leaderboard.innerHTML = "<li>Error loading scores</li>";
                });
        }

        // Initialize Firebase connection test
        firebase.auth().onAuthStateChanged(() => {
            console.log("Firebase initialized successfully");
        });

        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    </script>
</body>
</html>
