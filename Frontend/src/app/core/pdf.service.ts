import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Paciente } from '../models/models';

// PDFs de dieta y seguimiento con la identidad de la marca.
@Injectable({ providedIn: 'root' })
export class PdfService {
  private header(doc: jsPDF, title: string, subtitle: string) {
    doc.setFillColor(242, 140, 0);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(17);
    doc.text('lau.micelli.nutricion', 14, 13);
    doc.setFontSize(10);
    doc.text(subtitle, 14, 22);
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(15);
    doc.text(title, 14, 42);
  }

  generateDietPdf(p: Paciente) {
    const doc = new jsPDF();
    this.header(doc, `Plan alimentario — ${p.nombre}`, `Objetivo: ${p.objetivo ?? '—'}`);
    doc.setFontSize(10);
    doc.text(`Alergias: ${p.alergias ?? '—'}  |  Patologías: ${p.patologias ?? '—'}`, 14, 50);
    doc.text(`Preferencias: ${p.preferencias ?? '—'}`, 14, 56, { maxWidth: 180 });

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
      headStyles: { fillColor: [242, 140, 0], textColor: [0, 0, 0] },
      styles: { fontSize: 10 },
    });

    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('* Plan de ejemplo. Las porciones se ajustan a cada evaluación antropométrica.', 14, y);
    doc.save(`dieta_${p.nombre.replace(/\s+/g, '_')}.pdf`);
  }

  generateProgressPdf(p: Paciente) {
    const doc = new jsPDF();
    this.header(doc, `Seguimiento — ${p.nombre}`, `Peso inicial: ${p.pesoInicial ?? '—'} kg · Altura: ${p.altura ?? '—'} cm`);
    autoTable(doc, {
      startY: 52,
      head: [['Fecha', 'Motivo', 'Peso (kg)', 'Observaciones']],
      body: p.consultas.map(c => [c.fecha, c.motivo, String(c.peso), c.observaciones ?? '']),
      headStyles: { fillColor: [242, 140, 0], textColor: [0, 0, 0] },
      styles: { fontSize: 10 },
    });
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Informe generado por lau.micelli.nutricion.', 14, y);
    doc.save(`seguimiento_${p.nombre.replace(/\s+/g, '_')}.pdf`);
  }
}
