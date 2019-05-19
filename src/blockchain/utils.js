const { ec } = require("elliptic");
const EC = new ec("secp256k1");

exports.getPublicKey = privateKey => {
  return EC.keyFromPrivate(privateKey, "hex")
    .getPublic()
    .encode("hex");
};

exports.toHexString = byteArray => {
  return Array.from(byteArray, byte => {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
};
