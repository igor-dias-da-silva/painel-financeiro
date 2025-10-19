import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { showError } from './toast';

/**
 * Exports an HTML element content to a PDF file.
 * @param elementId The ID of the HTML element to capture.
 * @param filename The name of the output PDF file.
 */
export const exportToPdf = async (elementId: string, filename: string) => {
  const input = document.getElementById(elementId);
  if (!input) {
    showError('Elemento de exportação não encontrado.');
    return;
  }

  try {
    // Temporarily remove scrollbar to ensure full capture
    const originalOverflow = input.style.overflow;
    input.style.overflow = 'visible';

    const canvas = await html2canvas(input, {
      scale: 2, // Higher scale for better resolution
      useCORS: true,
      logging: false,
    });

    input.style.overflow = originalOverflow; // Restore overflow

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Export PDF Error:', error);
    showError('Erro ao gerar PDF. Tente novamente.');
  }
};