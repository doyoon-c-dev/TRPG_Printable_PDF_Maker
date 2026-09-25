package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PageCalculationService {

    public List<Page> calculate(Request request) {
        if (!request.hasPositiveBaseDimensions()
                || (request.isGrid() && request.gridSize() <= 0)
                || request.printableWidth() <= 0
                || request.printableHeight() <= 0) {
            return List.of();
        }

        double pageWidth;
        double pageHeight;
        int pagesX;
        int pagesY;

        if (request.isGrid()) {
            int cellsPerPageX = (int) Math.floor(request.printableWidth() / request.gridSize());
            int cellsPerPageY = (int) Math.floor(request.printableHeight() / request.gridSize());

            if (cellsPerPageX <= 0 || cellsPerPageY <= 0) {
                return List.of();
            }

            pageWidth = cellsPerPageX * request.gridSize();
            pageHeight = cellsPerPageY * request.gridSize();
            pagesX = (int) Math.ceil(request.imageWidth() / pageWidth);
            pagesY = (int) Math.ceil(request.imageHeight() / pageHeight);
        } else {
            pageWidth = request.printableWidth();
            pageHeight = request.printableHeight();
            pagesX = (int) Math.ceil(request.imageWidth() / request.printableWidth());
            pagesY = (int) Math.ceil(request.imageHeight() / request.printableHeight());
        }

        List<Page> pages = new ArrayList<>(pagesX * pagesY);
        int pageIndex = 0;

        for (int y = 0; y < pagesY; y++) {
            for (int x = 0; x < pagesX; x++) {
                double sourceX = x * pageWidth;
                double sourceY = y * pageHeight;
                double sourceWidth = Math.min(pageWidth, request.imageWidth() - sourceX);
                double sourceHeight = Math.min(pageHeight, request.imageHeight() - sourceY);

                pages.add(new Page(pageIndex++, sourceX, sourceY, sourceWidth, sourceHeight));
            }
        }

        return pages;
    }

    public record Request(
            double imageWidth,
            double imageHeight,
            double gridSize,
            double printableWidth,
            double printableHeight,
            boolean isGrid
    ) {
        private boolean hasPositiveBaseDimensions() {
            return imageWidth > 0 && imageHeight > 0;
        }
    }

    public record Page(
            int pageIndex,
            double sourceX,
            double sourceY,
            double sourceWidth,
            double sourceHeight
    ) {
    }
}