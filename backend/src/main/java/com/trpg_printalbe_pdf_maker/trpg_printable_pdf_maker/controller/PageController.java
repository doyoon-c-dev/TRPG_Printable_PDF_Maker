package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.controller;

import com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.service.PageCalculationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pages")
public class PageController {

    private final PageCalculationService pageCalculationService;

    public PageController(PageCalculationService pageCalculationService) {
        this.pageCalculationService = pageCalculationService;
    }

    @PostMapping("/calculate")
    public List<PageCalculationService.Page> calculatePages(
            @RequestBody PageCalculationService.Request request
    ) {
        return pageCalculationService.calculate(request);
    }
}