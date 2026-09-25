package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.controller;

import com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.service.PdfGenerationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/pdfs")
public class PdfController {

    private final PdfGenerationService pdfGenerationService;

    public PdfController(PdfGenerationService pdfGenerationService) {
        this.pdfGenerationService = pdfGenerationService;
    }

    @PostMapping(
            value = "/generate",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<PdfGenerationService.Result> generate(
            @RequestPart("file") MultipartFile file,
            @RequestPart("request") PdfGenerationService.Request request
    ) throws IOException {
        return ResponseEntity.ok(pdfGenerationService.generate(file, request));
    }
}