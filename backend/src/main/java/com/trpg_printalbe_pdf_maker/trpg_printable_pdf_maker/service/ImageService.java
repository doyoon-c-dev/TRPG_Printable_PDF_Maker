package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;



@Service
public class ImageService {

    private static final int MAX_IMAGE_DIMENSION = 4096;

    public ProcessedImage process(MultipartFile file) throws IOException {

        BufferedImage original = ImageIO.read(file.getInputStream());

        if (original == null) {
            throw new IllegalArgumentException("지원하지 않는 이미지입니다.");
        }

        int originalWidth = original.getWidth();
        int originalHeight = original.getHeight();

        int longestSide = Math.max(
                originalWidth,
                originalHeight
        );

        // 이미 충분히 작다면 리사이즈하지 않는다.
        if (longestSide <= MAX_IMAGE_DIMENSION) {
            return new ProcessedImage(
                    file.getBytes(),
                    MediaType.parseMediaType(file.getContentType())
            );
        }

        double resizeFactor =
                (double) MAX_IMAGE_DIMENSION / longestSide;

        int width = Math.max(
                1,
                (int) Math.round(originalWidth * resizeFactor)
        );

        int height = Math.max(
                1,
                (int) Math.round(originalHeight * resizeFactor)
        );

        BufferedImage resized =
                new BufferedImage(
                        width,
                        height,
                        getImageType(file)
                );

        Graphics2D graphics = resized.createGraphics();

        graphics.setRenderingHint(
                RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BILINEAR
        );

        graphics.setRenderingHint(
                RenderingHints.KEY_RENDERING,
                RenderingHints.VALUE_RENDER_QUALITY
        );

        graphics.setRenderingHint(
                RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON
        );

        graphics.drawImage(
                original,
                0,
                0,
                width,
                height,
                null
        );

        graphics.dispose();

        byte[] data = convertToBytes(
                resized,
                file.getContentType()
        );

        return new ProcessedImage(
                data,
                MediaType.parseMediaType(file.getContentType())
        );
    }

    private int getImageType(MultipartFile file) {

        if (MediaType.IMAGE_PNG_VALUE.equals(file.getContentType())) {
            return BufferedImage.TYPE_INT_ARGB;
        }

        return BufferedImage.TYPE_INT_RGB;
    }

    private byte[] convertToBytes(
            BufferedImage image,
            String contentType
    ) throws IOException {

        String format;

        if (MediaType.IMAGE_PNG_VALUE.equals(contentType)) {
            format = "png";
        } else {
            format = "jpg";
        }

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        ImageIO.write(
                image,
                format,
                outputStream
        );

        return outputStream.toByteArray();
    }

    public record ProcessedImage(
            byte[] data,
            MediaType contentType
    ) {
    }
}


