const crypto = require("node:crypto");
const express = require("express");
const pool = require("../db");
const { normalisePhone } = require("../lib/phone");
const {
    SESSION_COOKIE_NAME,
    hashSessionToken,
} = require("../lib/middleware/auth");

const router = express.Router();

console.log("Authentication routes loaded.");

const ALLOWED_PURPOSES = new Set([
    "login",
    "register",
    "recover",
    "verify"
]);

const OTP_EXPIRY_MINUTES = 5;
const OTP_REQUEST_LIMIT = 3;
const OTP_REQUEST_WINDOW_MINUTES = 10;

const OTP_ATTEMPT_LIMIT = 5;
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS =
    SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

// Creates a one-way hash using the code and a private server secret.
function hashVerificationCode({ phone, purpose, code }) {
    const secret = process.env.OTP_HASH_SECRET;

    if (!secret) {
        throw new Error(
            "OTP_HASH_SECRET is not configured."
        );
    }

    return crypto
        .createHmac("sha256", secret)
        .update(`${phone}:${purpose}:${code}`)
        .digest("hex");
}

function sessionCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION_MS,
    };
}

function hashesMatch(first, second) {
    if (
        typeof first !== "string" ||
        typeof second !== "string"
    ) {
        return false;
    }

    const firstBuffer = Buffer.from(first, "hex");
    const secondBuffer = Buffer.from(second, "hex");

    if (
        firstBuffer.length === 0 ||
        firstBuffer.length !== secondBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        firstBuffer,
        secondBuffer
    );
}
// Generates and stores a verification code.
// In local development, code delivery is mocked through the API terminal.
router.post("/request-verification", async (req, res) => {
    const phone = normalisePhone(req.body?.phone);
    const purpose = req.body?.purpose;

    if (!phone) {
        return res.status(400).json({
            success: false,
            error: "Enter a valid phone number."
        });
    }

    if (!ALLOWED_PURPOSES.has(purpose)) {
        return res.status(400).json({
            success: false,
            error: "Invalid verification purpose."
        });
    }

    try {
        const recentRequests = await pool.query(
            `SELECT COUNT(*)::int AS request_count
             FROM otp_codes
             WHERE otp_phone = $1
               AND otp_purpose = $2
               AND otp_created_at >
                   NOW() - ($3 * INTERVAL '1 minute')`,
            [
                phone,
                purpose,
                OTP_REQUEST_WINDOW_MINUTES
            ]
        );

        if (
            recentRequests.rows[0].request_count >=
            OTP_REQUEST_LIMIT
        ) {
            return res.status(429).json({
                success: false,
                error:
                    "Too many verification requests. " +
                    "Please try again later."
            });
        }

        const code = crypto
            .randomInt(0, 1000000)
            .toString()
            .padStart(6, "0");

        const codeHash = hashVerificationCode({
            phone,
            purpose,
            code
        });

        await pool.query(
            `INSERT INTO otp_codes (
                otp_phone,
                otp_code_hash,
                otp_purpose,
                otp_expires_at,
                otp_request_ip
             )
             VALUES (
                $1,
                $2,
                $3,
                NOW() + ($4 * INTERVAL '1 minute'),
                $5
             )`,
            [
                phone,
                codeHash,
                purpose,
                OTP_EXPIRY_MINUTES,
                req.ip || null
            ]
        );

        if (
            process.env.NODE_ENV !== "production" &&
            process.env.MOCK_VERIFICATION_DELIVERY ===
            "console"
        ) {
            console.log("");
            console.log(
                `[mock verification] phone: ${phone}`
            );
            console.log(
                `[mock verification] purpose: ${purpose}`
            );
            console.log(
                `[mock verification] code: ${code}`
            );
            console.log("");
        }

        return res.status(201).json({
            success: true,
            message:
                "A verification code has been generated."
        });
    } catch (error) {
        console.error(
            "POST /api/auth/request-verification failed:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "Unable to generate a verification code."
        });
    }
});

router.post("/verify", async (req, res) => {
    const phone = normalisePhone(req.body?.phone);
    const purpose = req.body?.purpose;
    const code =
        typeof req.body?.code === "string"
            ? req.body.code.trim()
            : "";

    if (!phone) {
        return res.status(400).json({
            success: false,
            error: "Enter a valid phone number.",
        });
    }

    if (!ALLOWED_PURPOSES.has(purpose)) {
        return res.status(400).json({
            success: false,
            error: "Invalid verification purpose.",
        });
    }

    if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({
            success: false,
            error: "Enter the six-digit verification code.",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const otpResult = await client.query(
            `SELECT
                otp_id,
                otp_code_hash,
                otp_attempts,
                otp_expires_at,
                otp_consumed_at
             FROM otp_codes
             WHERE otp_phone = $1
               AND otp_purpose = $2
             ORDER BY otp_created_at DESC
             LIMIT 1
             FOR UPDATE`,
            [phone, purpose]
        );

        if (otpResult.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(401).json({
                success: false,
                error:
                    "The verification code is invalid or has expired.",
            });
        }

        const otp = otpResult.rows[0];

        const expired =
            new Date(otp.otp_expires_at).getTime() <=
            Date.now();

        const unavailable =
            otp.otp_consumed_at !== null ||
            expired ||
            otp.otp_attempts >= OTP_ATTEMPT_LIMIT;

        if (unavailable) {
            await client.query("ROLLBACK");

            return res.status(401).json({
                success: false,
                error:
                    "The verification code is invalid or has expired.",
            });
        }

        const submittedHash = hashVerificationCode({
            phone,
            purpose,
            code,
        });

        if (
            !hashesMatch(
                submittedHash,
                otp.otp_code_hash
            )
        ) {
            await client.query(
                `UPDATE otp_codes
                 SET
                    otp_attempts = otp_attempts + 1,
                    otp_consumed_at =
                        CASE
                            WHEN otp_attempts + 1 >= $2
                            THEN NOW()
                            ELSE otp_consumed_at
                        END
                 WHERE otp_id = $1`,
                [otp.otp_id, OTP_ATTEMPT_LIMIT]
            );

            await client.query("COMMIT");

            return res.status(401).json({
                success: false,
                error:
                    "The verification code is invalid or has expired.",
            });
        }

        if (purpose !== "login") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                error:
                    "This verification purpose is not available through the login endpoint.",
            });
        }

        const userResult = await client.query(
            `SELECT
                user_id,
                user_name,
                user_phone,
                user_email,
                user_role,
                user_status
             FROM users
             WHERE user_phone = $1
             LIMIT 1
             FOR UPDATE`,
            [phone]
        );

        if (userResult.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(401).json({
                success: false,
                error:
                    "No active account is registered with this phone number.",
            });
        }

        const user = userResult.rows[0];

        if (user.user_status !== "active") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                success: false,
                error: "This account is not available.",
            });
        }

        await client.query(
            `UPDATE otp_codes
             SET
                otp_consumed_at = NOW(),
                otp_attempts = otp_attempts + 1
             WHERE otp_id = $1`,
            [otp.otp_id]
        );

        await client.query(
            `UPDATE users
             SET user_phone_verified_at =
                    COALESCE(
                        user_phone_verified_at,
                        NOW()
                    )
             WHERE user_id = $1`,
            [user.user_id]
        );

        const sessionToken = crypto
            .randomBytes(32)
            .toString("base64url");

        const sessionTokenHash =
            hashSessionToken(sessionToken);

        const sessionResult = await client.query(
            `INSERT INTO sessions (
                user_id,
                session_token_hash,
                session_expires_at,
                session_user_agent,
                session_ip
             )
             VALUES (
                $1,
                $2,
                NOW() + ($3 * INTERVAL '1 day'),
                $4,
                $5
             )
             RETURNING session_id`,
            [
                user.user_id,
                sessionTokenHash,
                SESSION_DURATION_DAYS,
                req.get("user-agent") || null,
                req.ip || null,
            ]
        );

        await client.query("COMMIT");

        res.cookie(
            SESSION_COOKIE_NAME,
            sessionToken,
            sessionCookieOptions()
        );

        return res.json({
            success: true,
            session_id:
                sessionResult.rows[0].session_id,
            user: {
                user_id: user.user_id,
                user_name: user.user_name,
                user_phone: user.user_phone,
                user_email: user.user_email,
                user_role: user.user_role,
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "POST /api/auth/verify failed:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "Unable to verify the code and create a session.",
        });
    } finally {
        client.release();
    }
});

module.exports = router;