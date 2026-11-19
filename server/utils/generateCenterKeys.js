const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,

  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },

  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// Save keys
fs.writeFileSync(path.join(__dirname, "center-public.pem"), publicKey);

fs.writeFileSync(path.join(__dirname, "center-private.pem"), privateKey);

console.log("Center keys generated successfully.");
console.log("Public key saved to: center-public.pem");
console.log("Private key saved to: center-private.pem");
