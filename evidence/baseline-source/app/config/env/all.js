const port = Number(process.env.PORT || 4000);
const db = process.env.MONGODB_URI || "mongodb://mongo:27017/nodegoat";
const cookieSecret = process.env.SESSION_SECRET;

if (!cookieSecret || cookieSecret.length < 32) {
    throw new Error("SESSION_SECRET must be provided and at least 32 characters long");
}

module.exports = {
    port,
    db,
    cookieSecret,
    cryptoKey: process.env.CRYPTO_KEY || "",
    cryptoAlgo: "aes256",
    hostName: process.env.HOST_NAME || "localhost",
    environmentalScripts: []
};
