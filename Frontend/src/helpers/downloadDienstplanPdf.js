import domtoimage from 'dom-to-image-more';
import { jsPDF } from 'jspdf';

export async function downloadDienstplanPdf(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;

    const clone = element.cloneNode(true);
    clone.querySelectorAll('*').forEach(el => {
        el.style.boxShadow = 'none';
        el.style.ringWidth = '0';
        el.style.border = '1px solid #939496';      // Ganz dünne, graue Standardlinie
            el.style.backgroundImage = 'none';        // Keine Gradients
            el.style.backgroundColor = el.style.backgroundColor; // || 'white';
            el.style.color = 'black';               // Text immer schwarz
        
        if (el.classList.contains('truncate')) {
            el.style.whiteSpace = 'normal';
            el.style.overflow = 'visible';
        }
    });


  Object.assign(clone.style, {
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '1600px',       
        background: 'white',
        boxShadow: 'none',
        display: 'block'
    });

    document.body.appendChild(clone);

    try {
        // Das Foto vom Klon machen -> scale 2
        const dataUrl = await domtoimage.toPng(clone, {
            bgcolor: '#080808',
            quality: 1,
            scale: 2,
            width: 1600,
            height: clone.offsetHeight,
            filter: (node) => {
                const isButton = node.tagName === 'BUTTON';
                const isNoExport = node.classList && node.classList.contains('no-export');
                return !isButton && !isNoExport;
            }
        });

        // PDF generieren -_-
       const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const margin = 10;
        const maxWidth = pdfWidth - (margin * 2);
        const maxHeight = pdfHeight - (margin * 2);

        const imgProps = pdf.getImageProperties(dataUrl);
        
        // FIX: Ratio berechnen, damit es auf EINE Seite passt
        const ratio = Math.min(maxWidth / imgProps.width, maxHeight / imgProps.height);
        const finalWidth = imgProps.width * ratio;
        const finalHeight = imgProps.height * ratio;

        // Wichtig: Bild einfügen mit den berechneten Maßen
        pdf.addImage(dataUrl, 'PNG', margin, margin, finalWidth, finalHeight);
        pdf.save(`${filename}.pdf`);

    } catch (error) {
        console.error("Export fehlgeschlagen:", error);
    } finally {
        //  Klon entfernen
        document.body.removeChild(clone);
    }
}