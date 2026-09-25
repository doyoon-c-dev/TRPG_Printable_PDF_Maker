package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PageCalculationServiceTest {

    private final PageCalculationService service = new PageCalculationService();

    @Test
    void splitsGridAlignedPagesAndClipsTheLastPage() {
        PageCalculationService.Request request = new PageCalculationService.Request(
                250, 150, 50, 120, 100, true
        );

        List<PageCalculationService.Page> pages = service.calculate(request);

        assertThat(pages).containsExactly(
                new PageCalculationService.Page(0, 0, 0, 100, 100),
                new PageCalculationService.Page(1, 100, 0, 100, 100),
                new PageCalculationService.Page(2, 200, 0, 50, 100),
                new PageCalculationService.Page(3, 0, 100, 100, 50),
                new PageCalculationService.Page(4, 100, 100, 100, 50),
                new PageCalculationService.Page(5, 200, 100, 50, 50)
        );
    }

    @Test
    void returnsNoPagesWhenPrintableAreaCannotFitAGridCell() {
        PageCalculationService.Request request = new PageCalculationService.Request(
                250, 150, 200, 120, 100, true
        );

        assertThat(service.calculate(request)).isEmpty();
    }
}