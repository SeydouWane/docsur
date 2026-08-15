package num.aegis.signature.stepca;

import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.pkcs.PKCS10CertificationRequest;
import org.bouncycastle.pkcs.jcajce.JcaPKCS10CertificationRequestBuilder;
import org.bouncycastle.util.io.pem.PemObject;
import org.bouncycastle.util.io.pem.PemWriter;

import java.io.StringWriter;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Security;
import java.security.spec.ECGenParameterSpec;

/**
 * Génère une paire de clés éphémère (P-256) et la requête de signature de
 * certificat (CSR) associée, pour un usage unique : la clé privée ne quitte
 * jamais ce processus et est abandonnée dès la signature du PDF effectuée.
 */
public class EphemeralCsr {

    static {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    public final KeyPair keyPair;
    public final String csrPem;

    public EphemeralCsr(String commonName) {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("EC", BouncyCastleProvider.PROVIDER_NAME);
            generator.initialize(new ECGenParameterSpec("secp256r1"));
            this.keyPair = generator.generateKeyPair();

            X500Name subject = new X500Name("CN=" + commonName);
            JcaPKCS10CertificationRequestBuilder builder =
                new JcaPKCS10CertificationRequestBuilder(subject, keyPair.getPublic());
            ContentSigner signer = new JcaContentSignerBuilder("SHA256withECDSA")
                .setProvider(BouncyCastleProvider.PROVIDER_NAME)
                .build(keyPair.getPrivate());
            PKCS10CertificationRequest csr = builder.build(signer);

            StringWriter out = new StringWriter();
            try (PemWriter pemWriter = new PemWriter(out)) {
                pemWriter.writeObject(new PemObject("CERTIFICATE REQUEST", csr.getEncoded()));
            }
            this.csrPem = out.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de générer la CSR éphémère", e);
        }
    }
}
