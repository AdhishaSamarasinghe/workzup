const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email"); // Import email utility
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

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

const registerUser = catchAsync(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Email Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const userRole = role ? role.toUpperCase() : "JOBSEEKER";
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: userRole,
            emailVerificationToken: verificationTokenHash,
            emailVerificationExpires: verificationExpires,
        },
    });

    if (newUser.role === "JOBSEEKER") {
        await prisma.profile.create({ data: { userId: newUser.id } });
    }

    // Send Verification Email (Don't await it to avoid blocking the response)
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    sendEmail({
        to: newUser.email,
        subject: 'Verify your WorkzUp email address',
        html: `
            <h1>Welcome to WorkzUp, ${newUser.name}!</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}" target="_blank">Verify Email Address</a>
            <p>This link will expire in 24 hours.</p>
        `,
    }).catch(err => console.error("Failed to send verification email:", err));

    res.status(201).json({
        message: "User registered successfully. Please check your email to verify your account.",
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
});

const loginUser = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email address before logging in");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
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
});

const refreshAccessToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        throw new ApiError(401, "No refresh token provided");
    }

    // Verify JWT signature
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw new ApiError(403, "Invalid or expired refresh token");
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
        throw new ApiError(403, "Invalid refresh token or token reused");
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
});

const logoutUser = catchAsync(async (req, res) => {
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
});

const getMe = catchAsync(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true, createdAt: true, isEmailVerified: true },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json(user);
});

const verifyEmail = catchAsync(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    // Hash the token from the query to compare with DB
    const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token and ensure it hasn't expired
    const user = await prisma.user.findFirst({
        where: {
            emailVerificationToken: verificationTokenHash,
            emailVerificationExpires: { gt: new Date() } // Ensure it's not expired
        }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    // Update user to verified
    await prisma.user.update({
        where: { id: user.id },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        }
    });

    res.json({ message: "Email verified successfully. You can now log in." });
});

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, getMe, verifyEmail };
