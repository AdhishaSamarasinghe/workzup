const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const prisma = new PrismaClient();

// Helper to generate tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // Access token lifespan: 15 minutes
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" } // Refresh token lifespan: 7 days
    );

    return { accessToken, refreshToken };
};

// Helper to securely hash refreshToken before storing
const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role ? role.toUpperCase() : "JOBSEEKER";
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: userRole,
            },
        });

        if (newUser.role === "JOBSEEKER") {
            await prisma.profile.create({ data: { userId: newUser.id } });
        }

        const { accessToken, refreshToken } = generateTokens(newUser);

        // Store hashed refresh token in DB
        await prisma.refreshToken.create({
            data: {
                tokenHash: hashToken(refreshToken),
                userId: newUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            }
        });

        // Send HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: "User registered successfully",
            accessToken,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        // Store new hashed refresh token in DB
        await prisma.refreshToken.create({
            data: {
                tokenHash: hashToken(refreshToken),
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        });

        // Send HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            message: "Login successful",
            accessToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token provided" });
        }

        // Verify JWT signature
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(403).json({ error: "Invalid or expired refresh token" });
        }

        // Hash the token to find it in the DB
        const tokenHash = hashToken(refreshToken);
        const dbToken = await prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true }
        });

        if (!dbToken || dbToken.revoked) {
            // Possible token reuse attack detected! Revoke ALL tokens for this user.
            if (dbToken && dbToken.revoked) {
                await prisma.refreshToken.updateMany({
                    where: { userId: dbToken.userId },
                    data: { revoked: true }
                });
            }
            return res.status(403).json({ error: "Invalid refresh token or token reused" });
        }

        // Implement Refresh Token Rotation
        // 1. Revoke the old token
        await prisma.refreshToken.update({
            where: { id: dbToken.id },
            data: { revoked: true }
        });

        // 2. Generate new tokens
        const newTokens = generateTokens(dbToken.user);

        // 3. Store new refresh token in DB
        await prisma.refreshToken.create({
            data: {
                tokenHash: hashToken(newTokens.refreshToken),
                userId: dbToken.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        });

        // 4. Send new HTTP-only cookie
        res.cookie("refreshToken", newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken: newTokens.accessToken });

    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(500).json({ error: "Server error during token refresh" });
    }
};

const logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (refreshToken) {
            const tokenHash = hashToken(refreshToken);
            // Delete or revoke the token in the DB
            await prisma.refreshToken.updateMany({
                where: { tokenHash },
                data: { revoked: true }
            });
        }

        // Clear the cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: "Server error during logout" });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({ error: "Server error while fetching user profile" });
    }
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, getMe };
