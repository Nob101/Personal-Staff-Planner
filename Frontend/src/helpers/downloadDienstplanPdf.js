downloadDienstplanPdf.js
import domtoimage from 'dom-to-image-more';
import { jsPDF } from 'jspdf';
 
export async function downloadDienstplanPdf(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;
 
    const clone = element.cloneNode(true);
    clone.querySelectorAll('*').forEach(el => {
        el.style.boxShadow = 'none';
        el.style.ringWidth = '0';
        el.style.border = 'none';      // Ganz dünne, graue Standardlinie
            el.style.backgroundImage = 'none';        // Keine Gradients
          
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
        width: 'auto',      // FIX: Passt sich dem Inahalt an
        display: 'inline-block', //NEU: verhindert breite Streckung
        background: 'white',
        boxShadow: 'none',
        display: 'block'
    });
 
    document.body.appendChild(clone);
 
    try {
        //NEU: Das Foto vom Klon machen -> scale von 2 auf 3
        const dataUrl = await domtoimage.toPng(clone, {
            bgcolor: '#f3ebeb',
            quality: 1,
            scale: 3,
           
              // FIX: Interaktive Elemente entfernen
            // filter: (node) => {
            //     const isButton = node.tagName === 'BUTTON';
            //     const isNoExport = node.classList && node.classList.contains('no-export');
            //     return !isButton && !isNoExport;
            // }
        } );
 
        // PDF generieren -_-
       const pdf = new jsPDF({ orientation: 'landscape',
         unit: 'mm', 
         format: 'a4' 
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
       
        const margin = 10;
        const maxWidth = pdfWidth - (margin * 2);
        const maxHeight = pdfHeight - (margin * 2);
 
        const imgProps = pdf.getImageProperties(dataUrl);
       
        // FIX: Größe anpassen -> Adjust
        let adjustedWidth = maxWidth;
        let adjustedHeight = (imgProps.height * adjustedWidth) / imgProps.width;
        // NEU: Höhe skalieren -> Bild war zu Hoch
        if (adjustedHeight > maxHeight) {
            adjustedHeight = maxHeight;
            adjustedWidth = (imgProps.width * adjustedHeight) / imgProps.height;
        }

        const xOffset = margin + (maxWidth - adjustedWidth) / 2;
        const yOffset = margin;

        // Wichtig: Bild einfügen mit den berechneten Maßen
            pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, adjustedWidth, adjustedHeight);
            pdf.save(`${filename}.pdf`);
 
    } catch (error) {
        console.error("Export fehlgeschlagen:", error);
    } finally {
        //  Klon entfernen
        document.body.removeChild(clone);
    }
}
 
 
// Gehört in die FilialeGridSection.vue

// async function onExportClick() {
//   await nextTick();
//   const elementId = `export-area-filiale-${props.filiale.fnr}`;
//   const dateiname = `Dienstplan_${props.filiale.filialname}_${props.monat}_${props.jahr}`;
//   await downloadDienstplanPdf(elementId, dateiname);
// }
 
