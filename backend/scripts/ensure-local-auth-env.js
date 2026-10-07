#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const backendDir = path.join(__dirname, "..");
const envPath = path.join(backendDir, ".env");
const examplePath = path.join(backendDir, ".env.example");

if (process.env.NODE_ENV === "production") {
    console.error("Local environment generation is disabled in production.");
    process.exit(1);
}

if (!fs.existsSync(envPath)) {
    if (!fs.existsSync(examplePath)) {
        console.error("backend/.env and backend/.env.example are both missing.");
        process.exit(1);
    }
    fs.copyFileSync(examplePath, envPath);
    console.log("Created backend/.env from backend/.env.example.");
}

let content = fs.readFileSync(envPath, "utf8");

function readValue(key) {
    const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
    return match ? match[1].trim() : null;
}

function writeValue(key, value) {
    const expression = new RegExp(`^${key}=.*$`, "m");

    if (expression.test(content)) {
        content = content.replace(expression, `${key}=${value}`);
        return;
    }

    if (content.length > 0 && !content.endsWith("\n")) {
        content += "\n";
    }
    content += `${key}=${value}\n`;
}

let changed = false;

const delivery = readValue("MOCK_VERIFICATION_DELIVERY");
if (!delivery) {
    writeValue("MOCK_VERIFICATION_DELIVERY", "console");
    changed = true;
    console.log("Configured local mock verification delivery.");
}

const existingSecret = readValue("OTP_HASH_SECRET");
const placeholderSecrets = new Set([
    "",
    "CHANGE_ME",
    "GENERATED_BY_SETUP",
    "GENERATE_A_UNIQUE_LOCAL_SECRET",
]);

if (existingSecret === null || placeholderSecrets.has(existingSecret)) {
    const secret = crypto.randomBytes(32).toString("hex");
    writeValue("OTP_HASH_SECRET", secret);
    changed = true;
    console.log("Generated a persistent local OTP hash secret.");
}

if (changed) {
    fs.writeFileSync(envPath, content, "utf8");
    console.log("Local authentication environment is ready.");
} else {
    console.log("Local authentication environment already configured.");
}
