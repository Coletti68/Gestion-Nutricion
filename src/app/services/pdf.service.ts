import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PdfService {
  private header(doc: jsPDF, title: string, subtitle: string) {
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('NutriGestión · Plan Profesional', 14, 12);
    doc.setFontSize(11);
    doc.text(subtitle, 14, 22);
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(15);
    doc.text(title, 14, 42);
  }

  generateDietPdf(p: Patient) {
    const doc = new jsPDF();
    this.header(doc, `Plan alimentario — ${p.nombre}`, `Objetivo: ${p.objetivo}`);
    doc.setFontSize(10);
    doc.text(`Alergias: ${p.alergias}  |  Patologías: ${p.patologias}`, 14, 50);
    doc.text(`Preferencias: ${p.preferencias}`, 14, 56, { maxWidth: 180 });

    autoTable(doc, {
      startY: 64,
      head: [['Comida', 'Opción recomendada']],
      body: [
        ['Desayuno', 'Avena con frutas y yogur natural (sin lactosa si aplica)'],
        ['Media mañana', 'Fruta fresca de estación + infusión'],
        ['Almuerzo', 'Proteína magra (pollo, pescado o legumbres) + verduras cocidas + carbohidrato integral'],
        ['Merienda', 'Frutos secos tolerados o lácteo + fruta'],
        ['Cena', 'Ensalada amplia + proteína magra + porción chica de carbohidrato'],
      ],
      headStyles: { fillColor: [46, 125, 50] },
      styles: { fontSize: 10 },
    });

    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('* Plan de ejemplo. Las porciones se ajustan a cada evaluación antropométrica.', 14, y);
    doc.save(`dieta_${p.nombre.replace(/\s+/g, '_')}.pdf`);
  }

  generateProgressPdf(p: Patient) {
    const doc = new jsPDF();
    this.header(doc, `Seguimiento — ${p.nombre}`, `Peso inicial: ${p.pesoInicial} kg · Altura: ${p.altura} cm`);
    autoTable(doc, {
      startY: 52,
      head: [['Fecha', 'Motivo', 'Peso (kg)', 'Observaciones']],
      body: p.consultas.map(c => [c.fecha, c.motivo, String(c.peso), c.observaciones]),
      headStyles: { fillColor: [46, 125, 50] },
      styles: { fontSize: 10 },
    });
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Informe generado por NutriGestión.', 14, y);
    doc.save(`seguimiento_${p.nombre.replace(/\s+/g, '_')}.pdf`);
  }
}
