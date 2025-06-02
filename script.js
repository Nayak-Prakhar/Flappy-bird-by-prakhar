<!DOCTYPE html><html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Flappy Bird</title>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
    <style>
        /* Keep your existing styles here */
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
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                console.log("Login successful");
            })
            .catch(err => {
                if (err.code === 'auth/user-not-found') {
                    alert("User not found. Please register.");
                } else if (err.code === 'auth/wrong-password') {
                    alert("Incorrect password.");
                } else {
                    alert("Error: " + err.message);
                }
            });
    }

    function register() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                alert("Registration successful. Now you can log in.");
            })
            .catch(err => {
                if (err.code === 'auth/email-already-in-use') {
                    alert("This email is already registered. Try logging in.");
                } else if (err.code === 'auth/weak-password') {
                    alert("Password should be at least 6 characters.");
                } else {
                    alert("Error: " + err.message);
                }
            });
    }

    function logout() {
        auth.signOut();
    }

    // The rest of the game logic remains unchanged
    // You can reuse the drawing and gameplay code as is
</script>

</body>
</html>
