package num.aegis.signature.stepca;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigInteger;
import java.security.AlgorithmParameters;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPrivateKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

/**
 * Signe un jeton one-time-token (OTT) attendu par le provisioner JWK de
 * step-ca : un JWS compact ES256 dont les revendications identifient le
 * signataire demandé (sub), le provisioner (iss), l'audience (l'URL de
 * l'endpoint /1.0/sign) et l'empreinte de la CA racine (sha).
 */
public class JwkSigner {

    private final PrivateKey privateKey;
    private final String kid;

    public JwkSigner(JsonNode jwk) {
        try {
            this.kid = jwk.get("kid").asText();
            byte[] d = decode(jwk.get("d").asText());

            AlgorithmParameters params = AlgorithmParameters.getInstance("EC");
            params.init(new ECGenParameterSpec("secp256r1"));
            ECParameterSpec ecSpec = params.getParameterSpec(ECParameterSpec.class);

            ECPrivateKeySpec keySpec = new ECPrivateKeySpec(new BigInteger(1, d), ecSpec);
            this.privateKey = KeyFactory.getInstance("EC").generatePrivate(keySpec);
        } catch (Exception e) {
            throw new IllegalStateException("Clé JWK du provisioner illisible", e);
        }
    }

    public String signOneTimeToken(String provisionerName, String subjectCN, String audienceUrl, String rootFingerprint) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            long now = System.currentTimeMillis() / 1000;

            Map<String, Object> header = Map.of("alg", "ES256", "kid", kid, "typ", "JWT");
            Map<String, Object> payload = Map.ofEntries(
                Map.entry("iss", provisionerName),
                Map.entry("sub", subjectCN),
                Map.entry("aud", audienceUrl),
                Map.entry("iat", now),
                Map.entry("nbf", now),
                Map.entry("exp", now + 300),
                Map.entry("jti", UUID.randomUUID().toString()),
                Map.entry("sha", rootFingerprint)
            );

            String encodedHeader = encode(mapper.writeValueAsBytes(header));
            String encodedPayload = encode(mapper.writeValueAsBytes(payload));
            String signingInput = encodedHeader + "." + encodedPayload;

            Signature signature = Signature.getInstance("SHA256withECDSAinP1363Format");
            signature.initSign(privateKey);
            signature.update(signingInput.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] sig = signature.sign();

            return signingInput + "." + encode(sig);
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de signer le jeton OTT", e);
        }
    }

    private static byte[] decode(String base64Url) {
        return Base64.getUrlDecoder().decode(base64Url);
    }

    private static String encode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }
}
