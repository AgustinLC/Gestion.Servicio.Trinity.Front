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
        const canvas = await html2canvas(contentRef.current, { 
          scale: 2,
          useCORS: true,
          logging: true
        });
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
      } catch (error) {
        console.error('Error generando PDF:', error);
      } finally {
        onGenerate(false); // Para ocultar el loading
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