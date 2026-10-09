// Converts supported local and international phone formats to E.164-style values.
function normalisePhone(value) {
    if (typeof value !== "string") {
        return null;
    }

    let phone = value
        .trim()
        .replace(/[\s\-()]/g, "");

    // Convert an international dialing prefix to "+".
    if (phone.startsWith("00")) {
        phone = `+${phone.slice(2)}`;
    }

    // Bangladesh local mobile format.
    if (/^01\d{9}$/.test(phone)) {
        phone = `+88${phone}`;
    }

    // Bangladesh number with country code but no "+".
    if (/^8801\d{9}$/.test(phone)) {
        phone = `+${phone}`;
    }

    // Australian local mobile format.
    if (/^04\d{8}$/.test(phone)) {
        phone = `+61${phone.slice(1)}`;
    }

    // Australian number with country code but no "+".
    if (/^614\d{8}$/.test(phone)) {
        phone = `+${phone}`;
    }

    // Accept other correctly formatted international numbers.
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        return null;
    }

    return phone;
}

module.exports = {
    normalisePhone,
};