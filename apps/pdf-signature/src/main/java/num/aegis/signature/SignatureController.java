package num.aegis.signature;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class SignatureController {

    private final SignatureService signatureService;

    public SignatureController(SignatureService signatureService) {
        this.signatureService = signatureService;
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(java.util.Map.of("status", "up"));
    }

    @PostMapping(value = "/signer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> signer(
            @RequestParam("fichier") MultipartFile fichier,
            @RequestParam("image") MultipartFile image,
            @RequestParam("page") int page,
            @RequestParam("x") float x,
            @RequestParam("y") float y,
            @RequestParam("largeur") float largeur,
            @RequestParam("hauteur") float hauteur,
            @RequestParam("nomSignataire") String nomSignataire
    ) throws Exception {
        if (fichier.isEmpty() || !"application/pdf".equals(fichier.getContentType())
                && !java.util.Objects.requireNonNull(fichier.getOriginalFilename()).toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest().body("Fichier PDF manquant ou invalide".getBytes());
        }
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body("Image de signature manquante".getBytes());
        }
        if (nomSignataire == null || nomSignataire.isBlank()) {
            return ResponseEntity.badRequest().body("Nom du signataire manquant".getBytes());
        }

        byte[] signed = signatureService.signer(
            fichier, image,
            new SignatureService.ZoneSignature(page, x, y, largeur, hauteur),
            nomSignataire.trim()
        );

        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"signe.pdf\"")
            .body(signed);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleError(Exception e) {
        return ResponseEntity.status(422).body(java.util.Map.of("message",
            e.getMessage() != null ? e.getMessage() : "La signature a échoué"));
    }
}
