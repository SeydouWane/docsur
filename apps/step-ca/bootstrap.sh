#!/usr/bin/env bash
# Initialise l'autorité de certification interne (step-ca) et la TSA RFC 3161
# (dnl50/tsa-server) pour Aegis-Num. À exécuter une seule fois par
# environnement — les données vivent ensuite dans des volumes Docker nommés.
#
# Nécessite : docker, openssl, node (pour signer les jetons OTT en ES256).
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p secrets
CA_PASS=$(cat secrets/ca-password.txt 2>/dev/null || (openssl rand -base64 24 | tr -d '\n' | tee secrets/ca-password.txt))

echo "== step-ca : initialisation =="
docker volume create aegis-step-ca-data >/dev/null
docker rm -f aegis-step-ca 2>/dev/null || true
docker run -d --name aegis-step-ca -p 9000:9000 \
  -v aegis-step-ca-data:/home/step \
  -e "DOCKER_STEPCA_INIT_NAME=Aegis-Num CA" \
  -e "DOCKER_STEPCA_INIT_DNS_NAMES=localhost,aegis-step-ca,127.0.0.1" \
  -e "DOCKER_STEPCA_INIT_PROVISIONER_NAME=admin" \
  -e "DOCKER_STEPCA_INIT_PASSWORD=$CA_PASS" \
  smallstep/step-ca
sleep 5

ROOT_FINGERPRINT=$(docker logs aegis-step-ca 2>&1 | grep -o 'X.509 Root Fingerprint: [0-9a-f]*' | awk '{print $NF}')
echo "Root fingerprint : $ROOT_FINGERPRINT"
echo "$ROOT_FINGERPRINT" > secrets/root-fingerprint.txt

echo "== Provisioner JWK dédié au service de signature (certificats éphémères de signataire) =="
docker cp signataire.tpl aegis-step-ca:/tmp/signataire.tpl
MSYS_NO_PATHCONV=1 docker exec aegis-step-ca step crypto jwk create /tmp/aegis-sig-pub.json /tmp/aegis-sig-priv.json \
  --kty=EC --crv=P-256 --use=sig --alg=ES256 --no-password --insecure --force
MSYS_NO_PATHCONV=1 docker exec aegis-step-ca step ca provisioner add aegis-signatures --type=JWK \
  --public-key=/tmp/aegis-sig-pub.json --x509-template=/tmp/signataire.tpl \
  --x509-default-dur=15m --x509-max-dur=1h --ca-config=/home/step/config/ca.json
docker cp aegis-step-ca:/tmp/aegis-sig-priv.json secrets/provisioner-signatures-priv.json

echo "== Certificat TSA (horodatage RFC 3161, EKU timeStamping critique) =="
docker cp tsa.tpl aegis-step-ca:/tmp/tsa.tpl
MSYS_NO_PATHCONV=1 docker exec aegis-step-ca step crypto jwk create /tmp/tsa-bootstrap-pub.json /tmp/tsa-bootstrap-priv.json \
  --kty=EC --crv=P-256 --use=sig --alg=ES256 --no-password --insecure --force
MSYS_NO_PATHCONV=1 docker exec aegis-step-ca step ca provisioner add aegis-tsa-bootstrap --type=JWK \
  --public-key=/tmp/tsa-bootstrap-pub.json --x509-template=/tmp/tsa.tpl \
  --x509-default-dur=8760h --x509-max-dur=8760h --ca-config=/home/step/config/ca.json
docker cp aegis-step-ca:/tmp/tsa-bootstrap-priv.json secrets/tsa-bootstrap-priv.json
docker restart aegis-step-ca
sleep 4

# Émission du certificat TSA via le provisioner ci-dessus (jeton OTT signé en Node, cf. sign-ott.js).
openssl ecparam -name prime256v1 -genkey -noout -out secrets/tsa-key.pem
MSYS_NO_PATHCONV=1 openssl req -new -key secrets/tsa-key.pem -subj "/CN=Aegis-Num TSA" -out secrets/tsa.csr
node sign-ott.js secrets/tsa-bootstrap-priv.json "$ROOT_FINGERPRINT" aegis-tsa-bootstrap \
  https://localhost:9000/1.0/sign secrets/tsa.csr "Aegis-Num TSA" > /tmp/tsa-sign-body.json
curl -sk -X POST https://localhost:9000/1.0/sign -H "Content-Type: application/json" \
  -d @/tmp/tsa-sign-body.json -o /tmp/tsa-sign-response.json
node -e "
const r = JSON.parse(require('fs').readFileSync('/tmp/tsa-sign-response.json', 'utf8'));
require('fs').writeFileSync('secrets/tsa.crt', r.crt);
require('fs').writeFileSync('secrets/tsa-intermediate.crt', r.ca);
"
curl -sk https://localhost:9000/roots.pem -o secrets/root.crt
cat secrets/tsa-intermediate.crt secrets/root.crt > secrets/tsa-chain.pem

TSA_KS_PASS=$(cat secrets/tsa-keystore-password.txt 2>/dev/null || (openssl rand -base64 24 | tr -d '\n' | tee secrets/tsa-keystore-password.txt))
openssl pkcs12 -export -inkey secrets/tsa-key.pem -in secrets/tsa.crt -certfile secrets/tsa-chain.pem \
  -name tsa -out secrets/tsa-keystore.p12 -passout "pass:$TSA_KS_PASS"

# Le provisioner de bootstrap n'a plus d'usage une fois le certificat émis
# (le certificat TSA est valide 1 an et ne se renouvelle pas via ce provisioner).
MSYS_NO_PATHCONV=1 docker exec aegis-step-ca step ca provisioner remove aegis-tsa-bootstrap --ca-config=/home/step/config/ca.json
docker restart aegis-step-ca
sleep 3

echo "== TSA (dnl50/tsa-server) =="
docker volume create aegis-tsa-data >/dev/null
docker rm -f aegis-tsa 2>/dev/null || true
docker create --name aegis-tsa-init -v aegis-tsa-data:/work smallstep/step-ca true >/dev/null
docker cp secrets/tsa-keystore.p12 aegis-tsa-init:/work/keystore.p12
docker rm aegis-tsa-init >/dev/null
MSYS_NO_PATHCONV=1 docker run -d --name aegis-tsa -p 9200:8080 -v aegis-tsa-data:/work \
  -e "QUARKUS_HTTP_PORT=8080" \
  -e "TSA_KEYSTORE_PATH=/work/keystore.p12" \
  -e "TSA_KEYSTORE_PASSWORD=$TSA_KS_PASS" \
  dnl50/tsa-server:3.3.0-jvm

echo "== Terminé =="
echo "step-ca      : https://localhost:9000 (fingerprint $ROOT_FINGERPRINT)"
echo "TSA RFC 3161 : http://localhost:9200/sign"
echo "Secrets dans ./secrets (jamais commités — voir .gitignore)."
