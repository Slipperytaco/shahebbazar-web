const crypto = require("node:crypto");
const express = require("express");
const pool = require("../db");

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

// Converts common Bangladesh phone formats to an E.164-style value.
function normalisePhone(value) {
    if (typeof value !== "string") {
        return null;
    }

    let phone = value
        .trim()
        .replace(/[\s\-()]/g, "");

    if (phone.startsWith("01")) {
        phone = `+88${phone}`;
    } else if (phone.startsWith("880")) {
        phone = `+${phone}`;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        return null;
    }

    return phone;
}

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

module.exports = router;