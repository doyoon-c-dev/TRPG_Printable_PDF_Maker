package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Service
public class PdfGenerationService {

    private static final double DEFAULT_DPI = 300.0;
    private static final double POINTS_PER_MM = 72.0 / 25.4;

    private final PageCalculationService pageCalculationService;

    public PdfGenerationService(PageCalculationService pageCalculationService) {
        this.pageCalculationService = pageCalculationService;
    }

    public Result generate(MultipartFile file, Request request) throws IOException {
        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) {
            throw new IllegalArgumentException("지원하지 않는 이미지입니다.");
        }

        Settings settings = request.settings();
        double imageScale = image.getWidth() / request.imageWidth();
        double scaleFactor = settings.scale() * 0.01;
        double marginTopMm = toMm(settings.marginTop(), settings.isPx());
        double marginBottomMm = toMm(settings.marginBottom(), settings.isPx());
        double marginLeftMm = toMm(settings.marginLeft(), settings.isPx());
        double marginRightMm = toMm(settings.marginRight(), settings.isPx());
        double paperWidthMm = toMm(settings.paperWidth(), settings.isPx());
        double paperHeightMm = toMm(settings.paperHeight(), settings.isPx());
        double printableWidthMm = paperWidthMm - marginLeftMm - marginRightMm;
        double printableHeightMm = paperHeightMm - marginTopMm - marginBottomMm;

        if (scaleFactor <= 0 || printableWidthMm <= 0 || printableHeightMm <= 0
                || imageScale <= 0 || request.imageWidth() <= 0 || request.imageHeight() <= 0) {
            throw new IllegalArgumentException("PDF 생성 설정이 올바르지 않습니다.");
        }

        double printableWidth = toPx(printableWidthMm, false) / scaleFactor;
        double printableHeight = toPx(printableHeightMm, false) / scaleFactor;
        double gridSize = toPx(settings.gridSize(), settings.isPx()) / scaleFactor;
        List<PageCalculationService.Page> pages = pageCalculationService.calculate(
                new PageCalculationService.Request(
                        request.imageWidth(),
                        request.imageHeight(),
                        gridSize,
                        printableWidth,
                        printableHeight,
                        settings.isGrid()
                )
        );

        if (pages.isEmpty()) {
            throw new IllegalArgumentException("생성할 페이지가 없습니다.");
        }

        byte[] pdfBytes;
        byte[] previewBytes = null;
        try (PDDocument document = new PDDocument()) {
            for (PageCalculationService.Page page : pages) {
                BufferedImage cropped = crop(image, page, imageScale);
                if (settings.isGrid()) {
                    drawGrid(cropped, gridSize * imageScale, settings);
                }

                byte[] pageImage = toPng(cropped);
                if (previewBytes == null) {
                    previewBytes = pageImage;
                }

                PDPage pdfPage = new PDPage(new PDRectangle(
                        (float) (paperWidthMm * POINTS_PER_MM),
                        (float) (paperHeightMm * POINTS_PER_MM)
                ));
                document.addPage(pdfPage);

                float outputWidth = (float) (toMm(page.sourceWidth() * scaleFactor, settings.isPx()) * POINTS_PER_MM);
                float outputHeight = (float) (toMm(page.sourceHeight() * scaleFactor, settings.isPx()) * POINTS_PER_MM);
                float marginLeft = (float) (marginLeftMm * POINTS_PER_MM);
                float marginTop = (float) (marginTopMm * POINTS_PER_MM);

                PDImageXObject imageObject = LosslessFactory.createFromImage(document, cropped);
                try (PDPageContentStream content = new PDPageContentStream(document, pdfPage)) {
                    content.drawImage(
                            imageObject,
                            marginLeft,
                            pdfPage.getMediaBox().getHeight() - marginTop - outputHeight,
                            outputWidth,
                            outputHeight
                    );
                }
            }

            try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                document.save(output);
                pdfBytes = output.toByteArray();
            }
        }

        return new Result(
                Base64.getEncoder().encodeToString(pdfBytes),
                Base64.getEncoder().encodeToString(previewBytes)
        );
    }

    private BufferedImage crop(BufferedImage image, PageCalculationService.Page page, double imageScale) {
        int sourceX = Math.round((float) (page.sourceX() * imageScale));
        int sourceY = Math.round((float) (page.sourceY() * imageScale));
        int sourceWidth = Math.min(Math.round((float) (page.sourceWidth() * imageScale)), image.getWidth() - sourceX);
        int sourceHeight = Math.min(Math.round((float) (page.sourceHeight() * imageScale)), image.getHeight() - sourceY);

        if (sourceX < 0 || sourceY < 0 || sourceWidth <= 0 || sourceHeight <= 0) {
            throw new IllegalArgumentException("페이지 영역이 이미지 범위를 벗어났습니다.");
        }

        return image.getSubimage(sourceX, sourceY, sourceWidth, sourceHeight);
    }

    private void drawGrid(BufferedImage image, double gridSize, Settings settings) {
        Graphics2D graphics = image.createGraphics();
        try {
            double gridPenSizePx = settings.gridPenSize();
            graphics.setColor(Color.decode(settings.gridPenColor()));
            graphics.setStroke(new BasicStroke((float) (gridPenSizePx / (settings.scale() * 0.01))));

            for (double x = 0; x <= image.getWidth(); x += gridSize) {
                graphics.drawLine((int) Math.round(x), 0, (int) Math.round(x), image.getHeight());
            }
            for (double y = 0; y <= image.getHeight(); y += gridSize) {
                graphics.drawLine(0, (int) Math.round(y), image.getWidth(), (int) Math.round(y));
            }
        } finally {
            graphics.dispose();
        }
    }

    private byte[] toPng(BufferedImage image) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private double toMm(double value, boolean isPx) {
        return isPx ? value * 25.4 / DEFAULT_DPI : value;
    }

    private double toPx(double value, boolean isPx) {
        return isPx ? value : value * DEFAULT_DPI / 25.4;
    }

    public record Request(
            double imageWidth,
            double imageHeight,
            Settings settings
    ) {
    }

    public record Settings(
            boolean isPx,
            double marginTop,
            double marginBottom,
            double marginLeft,
            double marginRight,
            double paperWidth,
            double paperHeight,
            boolean isGrid,
            double gridSize,
            String gridPenColor,
            double gridPenSize,
            double scale
    ) {
    }

    public record Result(String pdfBase64, String previewBase64) {
    }
}