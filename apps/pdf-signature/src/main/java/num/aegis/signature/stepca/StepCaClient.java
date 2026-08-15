package num.aegis.signature.stepca;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import java.io.FileInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Client de l'API /1.0/sign de step-ca : construit une paire de clés et une
 * CSR éphémères, les échange contre un certificat de signataire de courte
 * durée via un jeton OTT signé par le provisioner JWK dédié. La confiance
 * TLS est portée par le certificat racine de notre propre CA (pas le
 * magasin de confiance système), puisque step-ca sert un certificat
 * auto-signé.
 */
@Component
public class StepCaClient {

    private final String url;
    private final String provisionerName;
    private final String rootFingerprint;
    private final JwkSigner jwkSigner;
    private final HttpClient httpClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public StepCaClient(
        @Value("${step-ca.url}") String url,
        @Value("${step-ca.provisioner-name}") String provisionerName,
        @Value("${step-ca.root-fingerprint}") String rootFingerprint,
        @Value("${step-ca.root-cert-path}") String rootCertPath,
        @Value("${step-ca.provisioner-jwk-path}") String provisionerJwkPath
    ) throws Exception {
        this.url = url;
        this.provisionerName = provisionerName;
        this.rootFingerprint = rootFingerprint;

        JsonNode jwk = mapper.readTree(Files.readString(Path.of(provisionerJwkPath)));
        this.jwkSigner = new JwkSigner(jwk);

        SSLContext sslContext = buildTrustContext(rootCertPath);
        this.httpClient = HttpClient.newBuilder()
            .sslContext(sslContext)
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    public record SignedCertificate(X509Certificate leaf, List<X509Certificate> chain, java.security.PrivateKey privateKey) {}

    public SignedCertificate demanderCertificat(String commonName) {
        try {
            EphemeralCsr csr = new EphemeralCsr(commonName);
            String signUrl = url + "/1.0/sign";
            String ott = jwkSigner.signOneTimeToken(provisionerName, commonName, signUrl, rootFingerprint);

            String body = mapper.writeValueAsString(java.util.Map.of("csr", csr.csrPem, "ott", ott));
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(signUrl))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 201) {
                throw new IllegalStateException("step-ca a refusé la demande de certificat (" + response.statusCode() + "): " + response.body());
            }

            JsonNode json = mapper.readTree(response.body());
            CertificateFactory factory = CertificateFactory.getInstance("X.509");
            X509Certificate leaf = parseCertificate(factory, json.get("crt").asText());

            List<X509Certificate> chain = new ArrayList<>();
            chain.add(leaf);
            for (JsonNode certPem : json.get("certChain")) {
                X509Certificate cert = parseCertificate(factory, certPem.asText());
                if (!cert.equals(leaf)) {
                    chain.add(cert);
                }
            }

            return new SignedCertificate(leaf, chain, csr.keyPair.getPrivate());
        } catch (Exception e) {
            throw new IllegalStateException("Émission du certificat de signature impossible", e);
        }
    }

    private static X509Certificate parseCertificate(CertificateFactory factory, String pem) throws Exception {
        try (var in = new java.io.ByteArrayInputStream(pem.getBytes())) {
            return (X509Certificate) factory.generateCertificate(in);
        }
    }

    private static SSLContext buildTrustContext(String rootCertPath) throws Exception {
        CertificateFactory factory = CertificateFactory.getInstance("X.509");
        Certificate rootCert;
        try (FileInputStream in = new FileInputStream(rootCertPath)) {
            rootCert = factory.generateCertificate(in);
        }

        KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
        trustStore.load(null, null);
        trustStore.setCertificateEntry("aegis-num-root-ca", rootCert);

        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(trustStore);

        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, tmf.getTrustManagers(), null);
        return sslContext;
    }
}
