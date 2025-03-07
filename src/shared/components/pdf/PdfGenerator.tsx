import { forwardRef, useImperativeHandle, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PdfGeneratorProps {
  children: React.ReactNode;
  fileName: string;
  onGenerate: (isGenerating: boolean) => void;
}

const PdfGenerator = forwardRef<HTMLDivElement, PdfGeneratorProps>(
  ({ children, fileName, onGenerate }, ref) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

    const generatePdf = async () => {
      if (!contentRef.current) return;

      try {
        onGenerate(true);

        // Fijar el tamaño del contenido
        contentRef.current.style.width = '210mm';
        contentRef.current.style.height = '297mm';

        const canvas = await html2canvas(contentRef.current, {
          scale: 2, // Aumenta la escala para mejor calidad
          useCORS: true,
          logging: true,
          width: 210 * 3.78, // Convertir mm a px (210mm * 3.78px/mm)
          height: 297 * 3.78, // Convertir mm a px (297mm * 3.78px/mm)
          windowWidth: 210 * 3.78, // Ancho de la ventana virtual
          windowHeight: 297 * 3.78 // Alto de la ventana virtual
        });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(canvas.toDataURL('image/jpeg', 0.7), 'JPEG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
      } catch (error) {
        console.error('Error generando PDF:', error);
      } finally {
        onGenerate(false);
      }
    };

    return (
      <div style={{ position: 'fixed', left: '-9999px' }}>
        <div ref={contentRef}>{children}</div>
        <button onClick={generatePdf} style={{ display: 'none' }} id="pdf-trigger" />
      </div>
    );
  }
);

export default PdfGenerator;