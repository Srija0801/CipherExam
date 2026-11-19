const crypto = require("crypto");

const generateAESKey = () => {
  return crypto.randomBytes(32);
};

const generateIV = () => {
  return crypto.randomBytes(12);
};

const encryptWithAES = (data, key, iv) => {
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    authTag,
  };
};

const encryptAESKeyWithRSA = (aesKey, publicKey) => {
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    aesKey,
  );
};

const decryptWithAES = (encryptedData, key, iv, authTag) => {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted;
};

const decryptAESKeyWithRSA = (encryptedKey, privateKey) => {
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    encryptedKey,
  );
};

const verifySignature = (data, signature, publicKey) => {
  const verifier = crypto.createVerify("SHA256");

  verifier.update(data);
  verifier.end();

  return verifier.verify(publicKey, signature);
};

const signData = (data, privateKey) => {
  const signer = crypto.createSign("SHA256");

  signer.update(data);
  signer.end();

  return signer.sign(privateKey);
};
module.exports = {
  generateAESKey,
  generateIV,
  encryptWithAES,
  encryptAESKeyWithRSA,
  signData,
  verifySignature,
  decryptAESKeyWithRSA,
  decryptWithAES,
};
