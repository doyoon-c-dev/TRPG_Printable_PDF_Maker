import { jsPDF } from "jspdf";

interface ExportPdfOptions {
  pages: HTMLCanvasElement[];

  paperWidthMm: number;
  paperHeightMm: number;

  marginMm: number;

  fileName?: string;
}

export function exportPdf({
  pages,

  paperWidthMm,
  paperHeightMm,

  marginMm,

  fileName = "output.pdf",

}: ExportPdfOptions) {

  const pdf = new jsPDF({

    orientation:
      paperWidthMm > paperHeightMm
        ? "landscape"
        : "portrait",

    unit: "mm",

    format: [paperWidthMm, paperHeightMm],

  });

  pages.forEach((canvas, index) => {

    if (index > 0) {
      pdf.addPage();
    }

    const printableWidth =
      paperWidthMm - marginMm * 2;

    const printableHeight =
      paperHeightMm - marginMm * 2;

    pdf.addImage(

      canvas,

      "PNG",

      marginMm,

      marginMm,

      printableWidth,

      printableHeight

    );

  });

  pdf.save(fileName);

}