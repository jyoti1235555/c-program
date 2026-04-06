const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const PORT = 3000;
const SECRET_KEY = "your_secret_key";

// In-memory user storage (Replace with database in production)
const users = [];

/* ========================
   REGISTER ROUTE
======================== */
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const userExists = users.find(user => user.username === username);
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user
        users.push({
            username,
            password: hashedPassword
        });

        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ========================
   LOGIN ROUTE
======================== */
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = users.find(user => user.username === username);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { username: user.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ========================
   AUTH MIDDLEWARE
======================== */
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

/* ========================
   PROTECTED ROUTE
======================== */
app.get("/dashboard", authenticateToken, (req, res) => {
    res.send(`
        <h1>Protected Page</h1>
        <p>Welcome ${req.user.username}! You are logged in.</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});