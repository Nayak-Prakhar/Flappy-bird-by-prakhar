<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Flappy Bird</title>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
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
            flex-wrap: wrap;
            gap: 10px;
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
            padding: 8px;
            background: #f5f5f5;
            margin: 5px 0;
            border-radius: 5px;
            text-align: left;
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
        
        .demo-info {
            margin-top: 15px;
            font-size: 12px;
            color: #666;
            background: rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 5px;
        }
        
        @media (max-width: 480px) {
            .game-header {
                font-size: 14px;
                padding: 10px;
                flex-direction: column;
            }
            
            #gameCanvas {
                height: 500px;
                max-height: 60vh;
            }
            
            button {
                padding: 15px 25px;
                font-size: 16px;
            }
            
            h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="authContainer">
            <h1>🐦 Flappy Bird</h1>
            <form id="authForm" onsubmit="return false;">
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Password (min 6 chars)" required minlength="6">
                <div>
                    <button type="button" onclick="login()">Login</button>
                    <button type="button" onclick="register()">Register</button>
                </div>
                <div class="demo-info">
                    <p><strong>Demo Mode:</strong> Use any email format (e.g., test@example.com) and password (6+ characters)</p>
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
                <strong>Instructions:</strong> Click on canvas, tap screen, or press SPACE/UP arrow to flap wings. Avoid the pipes!
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

        // Initialize Firebase
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

        // Authentication State Management
        auth.onAuthStateChanged(user => {
            console.log("Auth state changed:", user ? `User: ${user.email}` : "No user");
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

        // Authentication Functions
        function login() {
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            
            if (!email || !password) {
                alert("Please enter both email and password");
                return;
            }
            
            const loginBtn = event.target;
            loginBtn.disabled = true;
            loginBtn.textContent = "Logging in...";
            
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    console.log("Login successful");
                })
                .catch(err => {
                    console.error("Login error:", err);
                    let errorMessage = "Login failed: ";
                    switch(err.code) {
                        case 'auth/user-not-found':
                            errorMessage += "No account found with this email. Please register first.";
                            break;
                        case 'auth/wrong-password':
                            errorMessage += "Incorrect password.";
                            break;
                        case 'auth/invalid-email':
                            errorMessage += "Invalid email format.";
                            break;
                        case 'auth/too-many-requests':
                            errorMessage += "Too many failed attempts. Please try again later.";
                            break;
                        default:
                            errorMessage += err.message;
                    }
                    alert(errorMessage);
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
            
            const registerBtn = event.target;
            registerBtn.disabled = true;
            registerBtn.textContent = "Registering...";
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(() => {
                    console.log("Registration successful");
                    alert("Account created successfully! You are now logged in.");
                })
                .catch(err => {
                    console.error("Registration error:", err);
                    let errorMessage = "Registration failed: ";
                    switch(err.code) {
                        case 'auth/email-already-in-use':
                            errorMessage += "An account with this email already exists. Try logging in instead.";
                            break;
                        case 'auth/invalid-email':
                            errorMessage += "Invalid email format.";
                            break;
                        case 'auth/weak-password':
                            errorMessage += "Password is too weak. Use at least 6 characters.";
                            break;
                        default:
                            errorMessage += err.message;
                    }
                    alert(errorMessage);
                })
                .finally(() => {
                    registerBtn.disabled = false;
                    registerBtn.textContent = "Register";
                });
        }

        function logout() {
            auth.signOut().then(() => {
                console.log("Logout successful");
            }).catch(err => {
                console.error("Logout error:", err);
                alert("Error logging out: " + err.message);
            });
        }

        // Game Variables (Fixed and Improved)
        let birdY = 300;
        let birdV = 0;
        let gravity = 0.5;
        let jumpStrength = -8;
        let score = 0;
        let pipes = [];
        let gameLoop;
        let running = false;
        let gameStarted = false;
        let pipeSpeed = 2;
        let pipeGap = 120;
        let pipeWidth = 50;
        let pipeSpacing = 200;

        function startGame() {
            // Reset game state
            birdY = 300;
            birdV = 0;
            score = 0;
            pipes = [];
            running = false;
            gameStarted = false;
            startBtn.disabled = true;
            scoreDisplay.innerText = "0";

            // Create initial pipe
            pipes.push({ 
                x: canvas.width + 50, 
                y: Math.random() * 250 + 150,
                scored: false 
            });

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
                    gameStarted = true;
                    gameLoop = requestAnimationFrame(draw);
                }
            }, 1000);
        }

        // Input Controls (Fixed)
        canvas.addEventListener("click", (e) => {
            e.preventDefault();
            if (running && gameStarted) {
                birdV = jumpStrength;
            }
        });

        canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (running && gameStarted) {
                birdV = jumpStrength;
            }
        });

        document.addEventListener("keydown", e => {
            if (e.key === " " || e.key === "ArrowUp") {
                e.preventDefault();
                if (running && gameStarted) {
                    birdV = jumpStrength;
                }
            }
        });

        function draw() {
            if (!running) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update bird physics
            birdV += gravity;
            birdY += birdV;

            // Draw bird
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

                // Remove off-screen pipes
                if (pipe.x + pipeWidth < 0) {
                    pipes.splice(i, 1);
                    continue;
                }

                // Add new pipe when needed
                if (pipes.length === 1 && pipe.x < canvas.width - pipeSpacing) {
                    pipes.push({ 
                        x: canvas.width, 
                        y: Math.random() * 250 + 150,
                        scored: false 
                    });
                }

                // Draw pipes
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

                // Scoring (Fixed)
                if (!pipe.scored && pipe.x + pipeWidth < 80) {
                    score++;
                    pipe.scored = true;
                    scoreDisplay.innerText = score;
                }

                // Collision detection (Fixed)
                if (pipe.x < 95 && pipe.x + pipeWidth > 65) {
                    if (birdY - 15 <= topHeight || birdY + 15 >= bottomY) {
                        endGame();
                        return;
                    }
                }
            }

            // Ground/ceiling collision
            if (birdY >= canvas.height - 15 || birdY <= 15) {
                endGame();
                return;
            }

            gameLoop = requestAnimationFrame(draw);
        }

        function endGame() {
            if (!running) return; // Prevent multiple calls
            
            cancelAnimationFrame(gameLoop);
            running = false;
            gameStarted = false;
            startBtn.disabled = false;
            startBtn.innerText = "Play Again";
            
            // Game over overlay
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = "white";
            ctx.font = "bold 30px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Game Over!", canvas.width/2, canvas.height/2 - 40);
            
            ctx.font = "20px Arial";
            ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2);
            
            ctx.font = "16px Arial";
            ctx.fillText("Click 'Play Again' to restart", canvas.width/2, canvas.height/2 + 40);
            
            saveScore(score);
        }

        function saveScore(score) {
            const user = auth.currentUser;
            if (!user) {
                console.log("No user logged in, cannot save score");
                return;
            }

            console.log(`Saving score: ${score} for user: ${user.email}`);
            
            db.collection("flappyScores").add({
                email: user.email,
                score: score,
                timestamp: Date.now()
            }).then(() => {
                console.log("Score saved successfully");
                loadLeaderboard();
            }).catch(err => {
                console.error("Error saving score:", err);
                alert("Error saving score: " + err.message);
            });
        }

        function loadLeaderboard() {
            console.log("Loading leaderboard...");
            
            db.collection("flappyScores")
                .orderBy("score", "desc")
                .limit(5)
                .get()
                .then(snapshot => {
                    leaderboard.innerHTML = "";
                    
                    if (snapshot.empty) {
                        const li = document.createElement("li");
                        li.innerText = "No scores yet. Be the first to play!";
                        li.style.textAlign = 
