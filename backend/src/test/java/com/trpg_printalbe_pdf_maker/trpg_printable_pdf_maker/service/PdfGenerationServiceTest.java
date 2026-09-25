package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import static org.assertj.core.api.Assertions.assertThat;

class PdfGenerationServiceTest {

    @Test
    void generatesPdfAndPreviewFromAnImage() throws Exception {
        BufferedImage image = new BufferedImage(1000, 1000, BufferedImage.TYPE_INT_RGB);
        image.createGraphics().setColor(Color.WHITE);
        image.createGraphics().fillRect(0, 0, 1000, 1000);

        ByteArrayOutputStream imageBytes = new ByteArrayOutputStream();
        ImageIO.write(image, "png", imageBytes);
        MockMultipartFile file = new MockMultipartFile(
                "file", "map.png", "image/png", imageBytes.toByteArray()
        );

        PdfGenerationService service = new PdfGenerationService(new PageCalculationService());
        PdfGenerationService.Result result = service.generate(
                file,
                new PdfGenerationService.Request(
                        1000,
                        1000,
                        new PdfGenerationService.Settings(
                                true,
                                10,
                                10,
                                10,
                                10,
                                2480,
                                3508,
                                true,
                                300,
                                "#000000",
                                10,
                                100
                        )
                )
        );

        assertThat(result.pdfBase64()).isNotBlank();
        assertThat(result.previewBase64()).isNotBlank();
    }
}