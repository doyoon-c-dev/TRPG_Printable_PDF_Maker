package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.controller;

import com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.service.ImageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping(
            value = "/process",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<byte[]> processImage(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        ImageService.ProcessedImage result = imageService.process(file);

        return ResponseEntity
                .ok()
                .contentType(result.contentType())
                .body(result.data());
    }
}