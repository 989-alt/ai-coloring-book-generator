import { jsPDF } from "jspdf";

export const generatePDF = (images: string[], title: string = "Coloring Book") => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const imageWidth = pageWidth - (margin * 2);
  const imageHeight = pageHeight - (margin * 2);

  images.forEach((imgData, index) => {
    if (index > 0) doc.addPage();
    doc.addImage(imgData, 'PNG', margin, margin, imageWidth, imageHeight, undefined, 'FAST');
    doc.setFontSize(10);
    doc.text(`Created with AI Coloring Book - Page ${index + 1}`, pageWidth / 2, pageHeight - 5, { align: "center" });
  });

  doc.save(`${title}_coloring_book.pdf`);
};