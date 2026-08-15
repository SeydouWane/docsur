// Construit le corps de requête (CSR + jeton OTT signé ES256) attendu par
// l'API /1.0/sign de step-ca pour un provisioner JWK. Utilisé par
// bootstrap.sh pour émettre le certificat TSA, et sert de référence pour
// l'équivalent Java du microservice de signature (mêmes revendications).
//
// Usage : node sign-ott.js <jwk-prive.json> <empreinte-racine> <nom-provisioner> <url-sign> <csr.pem> <CN>
const crypto = require("crypto");
const fs = require("fs");

const [, , jwkPath, rootFingerprint, provisionerName, caUrl, csrPemPath, subjectCN] = process.argv;

function b64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const jwk = JSON.parse(fs.readFileSync(jwkPath, "utf8"));
const header = { alg: "ES256", kid: jwk.kid, typ: "JWT" };
const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: provisionerName,
  sub: subjectCN,
  aud: caUrl,
  iat: now,
  nbf: now,
  exp: now + 300,
  jti: crypto.randomUUID(),
  sha: rootFingerprint,
};

const encodedHeader = b64url(JSON.stringify(header));
const encodedPayload = b64url(JSON.stringify(payload));
const signingInput = `${encodedHeader}.${encodedPayload}`;

const privateKey = crypto.createPrivateKey({ key: jwk, format: "jwk" });
const derSig = crypto.sign("sha256", Buffer.from(signingInput), { key: privateKey, dsaEncoding: "ieee-p1363" });
const jws = `${signingInput}.${b64url(derSig)}`;

const csrPem = fs.readFileSync(csrPemPath, "utf8");
console.log(JSON.stringify({ csr: csrPem, ott: jws }));
