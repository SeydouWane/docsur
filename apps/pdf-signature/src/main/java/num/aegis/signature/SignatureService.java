package num.aegis.signature;

import eu.europa.esig.dss.enumerations.DigestAlgorithm;
import eu.europa.esig.dss.enumerations.MimeTypeEnum;
import eu.europa.esig.dss.enumerations.SignatureLevel;
import eu.europa.esig.dss.model.DSSDocument;
import eu.europa.esig.dss.model.InMemoryDocument;
import eu.europa.esig.dss.model.SignatureValue;
import eu.europa.esig.dss.model.ToBeSigned;
import eu.europa.esig.dss.pades.PAdESSignatureParameters;
import eu.europa.esig.dss.pades.SignatureFieldParameters;
import eu.europa.esig.dss.pades.SignatureImageParameters;
import eu.europa.esig.dss.pades.signature.PAdESService;
import eu.europa.esig.dss.service.tsp.OnlineTSPSource;
import eu.europa.esig.dss.spi.DSSUtils;
import eu.europa.esig.dss.spi.x509.tsp.TSPSource;
import eu.europa.esig.dss.token.DSSPrivateKeyEntry;
import eu.europa.esig.dss.token.Pkcs12SignatureToken;
import eu.europa.esig.dss.spi.validation.CommonCertificateVerifier;
import num.aegis.signature.stepca.StepCaClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;

@Service
public class SignatureService {

    private final StepCaClient stepCaClient;
    private final TSPSource tspSource;

    public SignatureService(StepCaClient stepCaClient, @Value("${tsa.url}") String tsaUrl) {
        this.stepCaClient = stepCaClient;
        this.tspSource = new OnlineTSPSource(tsaUrl);
    }

    public record ZoneSignature(int page, float x, float y, float largeur, float hauteur) {}

    public byte[] signer(MultipartFile pdf, MultipartFile image, ZoneSignature zone, String nomSignataire) throws Exception {
        StepCaClient.SignedCertificate signedCertificate = stepCaClient.demanderCertificat(nomSignataire);

        char[] password = genererMotDePassePhemere();
        X509Certificate[] chain = signedCertificate.chain().toArray(new X509Certificate[0]);

        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(null, null);
        keyStore.setKeyEntry("signataire", signedCertificate.privateKey(), password, chain);
        ByteArrayOutputStream keyStoreBytes = new ByteArrayOutputStream();
        keyStore.store(keyStoreBytes, password);

        try (Pkcs12SignatureToken token = new Pkcs12SignatureToken(
                new ByteArrayInputStream(keyStoreBytes.toByteArray()),
                new KeyStore.PasswordProtection(password))) {

            DSSPrivateKeyEntry keyEntry = token.getKeys().get(0);

            PAdESSignatureParameters parameters = new PAdESSignatureParameters();
            parameters.setSignatureLevel(SignatureLevel.PAdES_BASELINE_T);
            parameters.setDigestAlgorithm(DigestAlgorithm.SHA256);
            parameters.setSigningCertificate(keyEntry.getCertificate());
            parameters.setCertificateChain(keyEntry.getCertificateChain());
            parameters.setImageParameters(construireApparenceVisible(image, zone));

            PAdESService service = new PAdESService(new CommonCertificateVerifier());
            service.setTspSource(tspSource);

            DSSDocument pdfDocument = new InMemoryDocument(pdf.getBytes(), pdf.getOriginalFilename(), MimeTypeEnum.PDF);

            ToBeSigned dataToSign = service.getDataToSign(pdfDocument, parameters);
            SignatureValue signatureValue = token.sign(dataToSign, parameters.getDigestAlgorithm(), keyEntry);
            DSSDocument signedDocument = service.signDocument(pdfDocument, parameters, signatureValue);

            return DSSUtils.toByteArray(signedDocument);
        } finally {
            java.util.Arrays.fill(password, '\0');
        }
    }

    private SignatureImageParameters construireApparenceVisible(MultipartFile image, ZoneSignature zone) throws Exception {
        SignatureImageParameters imageParameters = new SignatureImageParameters();
        var mimeType = "image/png".equalsIgnoreCase(image.getContentType()) ? MimeTypeEnum.PNG : MimeTypeEnum.JPEG;
        imageParameters.setImage(new InMemoryDocument(image.getBytes(), image.getOriginalFilename(), mimeType));

        SignatureFieldParameters fieldParameters = new SignatureFieldParameters();
        fieldParameters.setPage(zone.page());
        fieldParameters.setOriginX(zone.x());
        fieldParameters.setOriginY(zone.y());
        fieldParameters.setWidth(zone.largeur());
        fieldParameters.setHeight(zone.hauteur());
        imageParameters.setFieldParameters(fieldParameters);

        return imageParameters;
    }

    private static char[] genererMotDePassePhemere() {
        byte[] raw = new byte[24];
        new SecureRandom().nextBytes(raw);
        return java.util.Base64.getEncoder().encodeToString(raw).toCharArray();
    }
}
