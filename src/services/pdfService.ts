import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CallRecord, PendingTask, FollowUpItem, Farmer, RouteItem } from '../types';
import { Task } from '../types/task';
import { setupPdfUnicodeFont, UNICODE_FONT_FAMILY } from './pdfUnicodeHelper';

export interface CustomPDFReportOptions {
  category?: 'calls' | 'tasks' | 'farmers' | 'routes' | 'master_audit';
  title?: string;
  dairyName?: string;
  reportDate?: string;
  startDate?: string;
  endDate?: string;
  dateRangeLabel?: string;
  officerName?: string;
  routeFilter?: string;
  orientation?: 'portrait' | 'landscape';
  includeSummaryCards?: boolean;
  includeSignatures?: boolean;
  includeFSSAI?: boolean;
  calls?: CallRecord[];
  tasks?: Task[];
  pendingTasks?: PendingTask[];
  followUps?: FollowUpItem[];
  farmers?: Farmer[];
  routes?: RouteItem[];
}

export const PDFService = {
  /**
   * Universal Custom PDF Report Generator with Full Unicode Marathi (Devanagari) Support
   * Generates cleanly formatted, professional A4 PDF reports for any category, date range, and route.
   */
  generateCustomPDFReport: (options: CustomPDFReportOptions) => {
    const {
      category = 'calls',
      title = 'प्रोक्युअर डायरी - कार्य व संकलन अहवाल (Procure Diary Report)',
      dairyName = 'प्रोक्युअर डायरी - दूध संकलन व क्षेत्रीय अधिकारी CRM',
      reportDate = new Date().toISOString().split('T')[0],
      dateRangeLabel = 'सर्व कालावधी (All Time)',
      officerName = 'दूध संकलन अधिकारी (Procurement Executive)',
      routeFilter = 'सर्व रूट्स (All Routes)',
      orientation = 'portrait',
      includeSummaryCards = true,
      includeSignatures = true,
      includeFSSAI = true,
      calls = [],
      tasks = [],
      farmers = [],
      routes = [],
    } = options;

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });

    // 1. Embed and configure Unicode Devanagari Font (Noto Sans Devanagari)
    setupPdfUnicodeFont(doc);

    const pageWidth = orientation === 'landscape' ? 297 : 210;
    const pageHeight = orientation === 'landscape' ? 210 : 297;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const primaryColor = [5, 150, 105]; // Emerald-600 #059669
    const secondaryColor = [30, 41, 59]; // Slate #1e293b

    // 2. Corporate Header Background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 24, 'F');

    // 3. Header Titles & Subtitles in Marathi & English
    doc.setTextColor(255, 255, 255);
    doc.setFont(UNICODE_FONT_FAMILY, 'bold');
    doc.setFontSize(12.5);
    doc.text(dairyName, margin, 8.5);

    doc.setFontSize(8.2);
    doc.setFont(UNICODE_FONT_FAMILY, 'normal');
    doc.text('अधिकृत क्षेत्रीय दुग्ध संकलन, गवळी संपर्क व रोजनिशी अहवाल (Authorized Field Diary)', margin, 14.5);
    doc.text('ISO 22000 व FSSAI दुग्ध गुणवत्ता व सुरक्षा मानके पडताळणी नोंद (Compliance Audit)', margin, 19.5);

    // Right-aligned header timestamp & metadata
    doc.setFontSize(7.5);
    doc.text(`निर्मिती: ${new Date().toLocaleDateString('mr-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin, 8.5, { align: 'right' });
    doc.text(`अधिकारी: ${officerName}`, pageWidth - margin, 14.5, { align: 'right' });
    doc.text(`नोंद स्थिती: अधिकृत पडताळणी (Verified)`, pageWidth - margin, 19.5, { align: 'right' });

    // 4. Document Meta Section (Title, Date Range, Route)
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(11.5);
    doc.setFont(UNICODE_FONT_FAMILY, 'bold');
    doc.text(title, margin, 32);

    // Meta Information
    doc.setFontSize(8.5);
    doc.setFont(UNICODE_FONT_FAMILY, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`कालावधी: ${dateRangeLabel}`, margin, 38);
    doc.text(`रूट: ${routeFilter}`, margin + (orientation === 'landscape' ? 100 : 75), 38);
    doc.text(`प्रवर्ग: ${category.toUpperCase()}`, pageWidth - margin, 38, { align: 'right' });

    // Subtle divider
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(margin, 42, pageWidth - margin, 42);

    let currentY = 46;

    // 5. Executive Summary KPI Metric Cards (Optional)
    if (includeSummaryCards) {
      const cardCount = 4;
      const cardWidth = (contentWidth - (cardCount - 1) * 3.5) / cardCount;
      const cardHeight = 15;

      const drawStatBox = (
        x: number,
        label: string,
        val: number | string,
        sub: string,
        bg: [number, number, number],
        valColor: [number, number, number] = [30, 41, 59]
      ) => {
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont(UNICODE_FONT_FAMILY, 'bold');
        doc.text(label, x + 3, currentY + 4.5);

        doc.setTextColor(valColor[0], valColor[1], valColor[2]);
        doc.setFontSize(10.5);
        doc.setFont(UNICODE_FONT_FAMILY, 'bold');
        doc.text(String(val), x + 3, currentY + 10);

        doc.setFontSize(6.5);
        doc.setFont(UNICODE_FONT_FAMILY, 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(sub, x + 3, currentY + 13.5);
      };

      if (category === 'calls') {
        const totalCalls = calls.length;
        const completed = calls.filter(c => c.callStatus === 'Completed' || c.callStatus === 'Answered').length;
        const incoming = calls.filter(c => c.type === 'incoming').length;
        const followups = calls.filter(c => c.followUpDate || c.callStatus === 'Follow-up Required').length;

        drawStatBox(margin, 'एकूण कॉल नोंदी (Total)', totalCalls, `${calls.filter(c => c.type === 'outgoing').length} Out / ${incoming} In`, [241, 245, 249]);
        drawStatBox(margin + cardWidth + 3.5, 'उत्तर दिलेले (Answered)', completed, `${totalCalls > 0 ? Math.round((completed / totalCalls) * 100) : 0}% यश दर`, [220, 252, 231], [22, 101, 52]);
        drawStatBox(margin + (cardWidth + 3.5) * 2, 'इनबाउंड कॉल्स (Inbound)', incoming, 'गवळ्यांकडून आलेले', [238, 242, 255], [67, 56, 202]);
        drawStatBox(margin + (cardWidth + 3.5) * 3, 'फॉलो-अप आवश्यक', followups, 'नियोजित संपर्क', [254, 243, 199], [180, 83, 9]);
      } else if (category === 'tasks') {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const highPriority = tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;

        drawStatBox(margin, 'एकूण कामे (Total Tasks)', totalTasks, 'नोंदवलेली क्षेत्रीय कामे', [241, 245, 249]);
        drawStatBox(margin + cardWidth + 3.5, 'पूर्ण झालेली (Completed)', completedTasks, `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% पूर्तता दर`, [220, 252, 231], [22, 101, 52]);
        drawStatBox(margin + (cardWidth + 3.5) * 2, 'प्रगतीपथावर (In Progress)', inProgress, 'सध्या सुरू असलेली', [238, 242, 255], [67, 56, 202]);
        drawStatBox(margin + (cardWidth + 3.5) * 3, 'तातडीची तक्रार (Critical)', highPriority, 'उच्च प्राधान्य कामे', [254, 242, 242], [185, 28, 28]);
      } else if (category === 'farmers' || category === 'routes' || category === 'master_audit') {
        const totalProducers = farmers.length;
        const totalDailyMilk = farmers.reduce((sum, f) => sum + (f.dailyMilkQuantity || 0), 0);
        const cowMilk = farmers.filter(f => f.milkType === 'Cow').reduce((sum, f) => sum + (f.dailyMilkQuantity || 0), 0);
        const buffaloMilk = farmers.filter(f => f.milkType === 'Buffalo').reduce((sum, f) => sum + (f.dailyMilkQuantity || 0), 0);
        const tenDayBilling = farmers.reduce((sum, f) => sum + (f.dailyMilkQuantity || 0) * (f.currentRate || 39.5) * 10, 0);

        drawStatBox(margin, 'सक्रिय गवळी (Gavali)', totalProducers, `${farmers.filter(f => f.status === 'Active').length} नियमित पुरवठादार`, [241, 245, 249]);
        drawStatBox(margin + cardWidth + 3.5, 'दैनिक संकलन (Daily Milk)', `${totalDailyMilk.toLocaleString()} L`, `गाय: ${cowMilk}L | म्हैस: ${buffaloMilk}L`, [220, 252, 231], [22, 101, 52]);
        drawStatBox(margin + (cardWidth + 3.5) * 2, '१० दिवसांचे बिल (Est. Bill)', `₹${Number(tenDayBilling.toFixed(0)).toLocaleString('en-IN')}`, 'अंदाजित पेमेंट रक्कम', [238, 242, 255], [67, 56, 202]);
        drawStatBox(margin + (cardWidth + 3.5) * 3, 'FSSAI नोंदणी', `${farmers.filter(f => f.fssaiNumber).length} / ${totalProducers}`, 'अन्न सुरक्षा परवाना', [254, 243, 199], [180, 83, 9]);
      }

      currentY += 19;
    }

    // 6. Category-Specific Data Tables with Full Unicode AutoTable Configuration
    if (category === 'calls') {
      const callRows = calls.map((c, idx) => [
        idx + 1,
        `${c.date}\n${c.time || '-'} (${c.type === 'incoming' ? 'आवक' : 'जावक'})`,
        `${c.farmerName || 'गवळी'}\n[${c.farmerCode || '-'}]`,
        c.mobileNumber || '-',
        `${c.route || '-'}\n${c.village || '-'}`,
        c.callPurpose || 'सामान्य',
        c.callStatus || 'नोंदणी',
        c.discussion ? (c.discussion.length > 60 ? `${c.discussion.substring(0, 60)}...` : c.discussion) : '-',
        c.followUpDate || '-',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'दिनांक / वेळ', 'गवळी नाव व कोड', 'मोबाईल', 'रूट / गाव', 'कॉल उद्देश', 'स्थिती', 'चर्चा सारांश', 'फॉलो-अप']],
        body: callRows.length > 0 ? callRows : [['-', '-', 'निवडलेल्या फिल्टरनुसार नोंदी सापडल्या नाहीत', '-', '-', '-', '-', '-', '-']],
        theme: 'grid',
        styles: {
          font: UNICODE_FONT_FAMILY,
          fontStyle: 'normal',
          fontSize: orientation === 'landscape' ? 8 : 7.2,
          cellPadding: 2,
          textColor: [30, 41, 59],
          overflow: 'linebreak',
        },
        headStyles: {
          font: UNICODE_FONT_FAMILY,
          fontStyle: 'bold',
          fillColor: [22, 101, 52],
          textColor: [255, 255, 255],
          halign: 'center',
        },
        columnStyles: orientation === 'landscape'
          ? {
              0: { cellWidth: 10, halign: 'center' },
              1: { cellWidth: 26, halign: 'center' },
              2: { cellWidth: 45, fontStyle: 'bold' },
              3: { cellWidth: 25 },
              4: { cellWidth: 32 },
              5: { cellWidth: 32 },
              6: { cellWidth: 24, halign: 'center' },
              7: { cellWidth: 50 },
              8: { cellWidth: 25, halign: 'center' },
            }
          : {
              0: { cellWidth: 8, halign: 'center' },
              1: { cellWidth: 20, halign: 'center' },
              2: { cellWidth: 32, fontStyle: 'bold' },
              3: { cellWidth: 20 },
              4: { cellWidth: 22 },
              5: { cellWidth: 22 },
              6: { cellWidth: 18, halign: 'center' },
              7: { cellWidth: 25 },
              8: { cellWidth: 15, halign: 'center' },
            },
        margin: { left: margin, right: margin },
      });
    } else if (category === 'tasks') {
      const taskRows = tasks.map((t, idx) => [
        idx + 1,
        t.taskTitle,
        `${t.relatedGavali || 'गवळी'}\n[${t.gavaliCode || '-'}]`,
        `${t.route || '-'}\n${t.village || '-'}`,
        t.assignedToName || 'अधिकारी',
        t.dueDate || '-',
        t.priority || 'Normal',
        t.status || 'Pending',
        t.completionReport ? `पूर्ण: ${t.completionReport.finalResult || '-'}` : (t.notes ? `${t.notes.substring(0, 50)}...` : '-'),
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'कामाचा विषय / तक्रार', 'गवळी व कोड', 'रूट व गाव', 'नियुक्त अधिकारी', 'अंतिम मुदत', 'प्राधान्य', 'स्थिती', 'निवारण / टिप्पणी']],
        body: taskRows.length > 0 ? taskRows : [['-', 'निवडलेल्या कालावधीत कामे आढळली नाहीत', '-', '-', '-', '-', '-', '-', '-']],
        theme: 'striped',
        styles: {
          font: UNICODE_FONT_FAMILY,
          fontStyle: 'normal',
          fontSize: orientation === 'landscape' ? 8 : 7.2,
          cellPadding: 2,
          textColor: [30, 41, 59],
          overflow: 'linebreak',
        },
        headStyles: {
          font: UNICODE_FONT_FAMILY,
          fontStyle: 'bold',
          fillColor: [15, 118, 110],
          textColor: [255, 255, 255],
          halign: 'center',
        },
        columnStyles: orientation === 'landscape'
          ? {
              0: { cellWidth: 10, halign: 'center' },
              1: { cellWidth: 50, fontStyle: 'bold' },
              2: { cellWidth: 40 },
              3: { cellWidth: 32 },
              4: { cellWidth: 30 },
              5: { cellWidth: 22, halign: 'center' },
              6: { cellWidth: 22, halign: 'center' },
              7: { cellWidth: 24, halign: 'center' },
              8: { cellWidth: 39 },
            }
          : {
              0: { cellWidth: 8, halign: 'center' },
              1: { cellWidth: 34, fontStyle: 'bold' },
              2: { cellWidth: 28 },
              3: { cellWidth: 22 },
              4: { cellWidth: 22 },
              5: { cellWidth: 18, halign: 'center' },
              6: { cellWidth: 16, halign: 'center' },
              7: { cellWidth: 16, halign: 'center' },
              8: { cellWidth: 18 },
            },
        margin: { left: margin, right: margin },
      });
    } else if (category === 'farmers') {
      const farmerRows = farmers.map((f, idx) => {
        const tenDayEst = (f.dailyMilkQuantity * (f.currentRate || 39.5) * 10).toFixed(0);
        return [
          idx + 1,
          f.farmerCode,
          f.farmerName,
          f.mobileNumber,
          f.route,
          f.village,
          `${f.milkType === 'Cow' ? 'गाय' : 'म्हैस'}\n(${f.dailyMilkQuantity} L/दिवस)`,
          `${f.morningMilkQty || 0} स / ${f.eveningMilkQty || 0} सं`,
          `${f.avgFat || 3.8}% F\n${f.avgSNF || 8.5}% S`,
          `₹${f.currentRate || 39.5}`,
          `₹${Number(tenDayEst).toLocaleString('en-IN')}`,
          f.fssaiNumber ? `${f.fssaiNumber}\n[${f.fssaiStatus || 'सक्रिय'}]` : 'नोंदणी नाही',
          f.status === 'Active' ? 'सक्रिय' : 'बंद',
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            '#',
            'कोड',
            'गवळ्याचे नाव',
            'मोबाईल',
            'रूट',
            'गाव',
            'दूध प्रकार व प्रमाण',
            'सकाळ / संध्याकाळ',
            'FAT / SNF',
            'दर (₹/L)',
            '१० दिवसांचे बिल',
            'FSSAI परवाना व स्थिती',
            'स्थिती',
          ],
        ],
        body: farmerRows.length > 0 ? farmerRows : [['-', '-', 'कोणतीही गवळी नोंद आढळली नाही', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']],
        theme: 'grid',
        styles: {
          font: UNICODE_FONT_FAMILY,
          fontStyle: 'normal',
          fontSize: orientation === 'landscape' ? 7.5 : 6.8,
          cellPadding: 1.8,
          textColor: [30, 41, 59],
          overflow: 'linebreak',
        },
        headStyles: {
          font: UNICODE_FONT_FAMILY,
          fontStyle: 'bold',
          fillColor: [22, 101, 52],
          textColor: [255, 255, 255],
          halign: 'center',
        },
        columnStyles: orientation === 'landscape'
          ? {
              0: { cellWidth: 8, halign: 'center' },
              1: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
              2: { cellWidth: 42, fontStyle: 'bold' },
              3: { cellWidth: 22 },
              4: { cellWidth: 18 },
              5: { cellWidth: 20 },
              6: { cellWidth: 24, halign: 'center' },
              7: { cellWidth: 18, halign: 'center' },
              8: { cellWidth: 18, halign: 'center' },
              9: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
              10: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
              11: { cellWidth: 30, fontSize: 6.5 },
              12: { cellWidth: 15, halign: 'center' },
            }
          : {
              0: { cellWidth: 6, halign: 'center' },
              1: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
              2: { cellWidth: 32, fontStyle: 'bold' },
              3: { cellWidth: 18 },
              4: { cellWidth: 14 },
              5: { cellWidth: 15 },
              6: { cellWidth: 18, halign: 'center' },
              7: { cellWidth: 14, halign: 'center' },
              8: { cellWidth: 14, halign: 'center' },
              9: { cellWidth: 12, halign: 'center' },
              10: { cellWidth: 16, halign: 'right', fontStyle: 'bold' },
              11: { cellWidth: 20, fontSize: 6 },
              12: { cellWidth: 11, halign: 'center' },
            },
        margin: { left: margin, right: margin },
      });
    } else if (category === 'routes') {
      const routeRows = routes.map((r, idx) => {
        const routeFarmers = farmers.filter(f => f.route === r.routeNumber);
        const routeMilk = routeFarmers.reduce((sum, f) => sum + (f.dailyMilkQuantity || 0), 0);
        const cowMilk = routeFarmers.filter(f => f.milkType === 'Cow').reduce((sum, f) => sum + (f.dailyMilkQuantity || 0), 0);
        const buffMilk = routeFarmers.filter(f => f.milkType === 'Buffalo').reduce((sum, f) => sum + (f.dailyMilkQuantity || 0), 0);
        const estPayout = routeFarmers.reduce((sum, f) => sum + (f.dailyMilkQuantity || 0) * (f.currentRate || 39.5) * 10, 0);

        return [
          idx + 1,
          r.routeNumber,
          r.routeName,
          r.area || r.village || 'दुग्ध संकलन रूट',
          r.assignedOfficer || 'संकलन अधिकारी',
          routeFarmers.length,
          `${routeMilk.toLocaleString()} L`,
          `गाय: ${cowMilk}L | म्हैस: ${buffMilk}L`,
          `₹${Number(estPayout.toFixed(0)).toLocaleString('en-IN')}`,
          r.status === 'active' ? 'सक्रिय' : 'बंद',
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [
          ['#', 'रूट कोड', 'रूटचे नाव', 'कार्यक्षेत्र / गावे', 'नियुक्त अधिकारी', 'एकूण गवळी', 'दैनिक संकलन', 'गाय / म्हैस प्रमाण', '१० दिवसांचे बिल', 'स्थिती'],
        ],
        body: routeRows.length > 0 ? routeRows : [['-', '-', 'कोणताही रूट आढळला नाही', '-', '-', '-', '-', '-', '-', '-']],
        theme: 'grid',
        styles: { font: UNICODE_FONT_FAMILY, fontStyle: 'normal', fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
        headStyles: { font: UNICODE_FONT_FAMILY, fontStyle: 'bold', fillColor: [51, 65, 85], textColor: [255, 255, 255], halign: 'center' },
        margin: { left: margin, right: margin },
      });
    } else if (category === 'master_audit') {
      const routeRows = routes.map((r, idx) => {
        const routeFarmers = farmers.filter(f => f.route === r.routeNumber);
        const routeMilk = routeFarmers.reduce((sum, f) => sum + (f.dailyMilkQuantity || 0), 0);
        return [
          idx + 1,
          r.routeNumber,
          r.routeName,
          routeFarmers.length,
          `${routeMilk} L/दिवस`,
          calls.filter(c => c.route === r.routeNumber).length,
          tasks.filter(t => t.route === r.routeNumber && t.status !== 'Completed').length,
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'रूट कोड', 'रूटचे नाव', 'सक्रिय गवळी', 'दैनिक संकलन', 'कॉल नोंदी', 'प्रलंबित कामे']],
        body: routeRows,
        theme: 'grid',
        styles: { font: UNICODE_FONT_FAMILY, fontStyle: 'normal', fontSize: 7.5, cellPadding: 2 },
        headStyles: { font: UNICODE_FONT_FAMILY, fontStyle: 'bold', fillColor: [22, 101, 52], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
      });

      let nextY = (doc as any).lastAutoTable?.finalY || 160;
      if (nextY > pageHeight - 90) {
        doc.addPage();
        nextY = 20;
      }

      doc.setFontSize(10);
      doc.setFont(UNICODE_FONT_FAMILY, 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('महत्त्वाची प्रलंबित कामे व तातडीच्या तक्रारींचा आढावा (Critical Issues Log)', margin, nextY + 8);

      const criticalTasks = tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').slice(0, 10);
      const criticalTaskRows = criticalTasks.map((t, idx) => [
        idx + 1,
        t.taskTitle,
        t.relatedGavali,
        t.route,
        t.assignedToName,
        t.dueDate,
        t.priority,
        t.status,
      ]);

      autoTable(doc, {
        startY: nextY + 11,
        head: [['#', 'कामाचा विषय / तक्रार', 'गवळी', 'रूट', 'अधिकारी', 'अंतिम मुदत', 'प्राधान्य', 'स्थिती']],
        body: criticalTaskRows.length > 0 ? criticalTaskRows : [['-', 'कोणतीही तातडीची तक्रार प्रलंबित नाही', '-', '-', '-', '-', '-', '-']],
        theme: 'striped',
        styles: { font: UNICODE_FONT_FAMILY, fontStyle: 'normal', fontSize: 7.2, cellPadding: 1.8 },
        headStyles: { font: UNICODE_FONT_FAMILY, fontStyle: 'bold', fillColor: [185, 28, 28], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
      });
    }

    // 7. Signatures and Page Footers
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Add Official 3-Tier Signature Block on the Final Page if requested
      if (i === totalPages && includeSignatures) {
        const sigY = pageHeight - 32;
        const colWidth = (contentWidth - 20) / 3;

        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.4);
        doc.line(margin, sigY, margin + colWidth, sigY);
        doc.line(margin + colWidth + 10, sigY, margin + colWidth * 2 + 10, sigY);
        doc.line(margin + colWidth * 2 + 20, sigY, pageWidth - margin, sigY);

        doc.setFontSize(7.5);
        doc.setFont(UNICODE_FONT_FAMILY, 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('दूध संकलन अधिकारी स्वाक्षरी', margin, sigY + 4);
        doc.text('रूट सुपरवायझर / तपासणी अधिकारी', margin + colWidth + 10, sigY + 4);
        doc.text('डेअरी मॅनेजर / अंतिम मंजुरी शिक्का', margin + colWidth * 2 + 20, sigY + 4);

        doc.setFontSize(6.5);
        doc.setFont(UNICODE_FONT_FAMILY, 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`${officerName}`, margin, sigY + 8);
        doc.text(`क्षेत्रीय तपासणी व गुणवत्ता पडताळणी`, margin + colWidth + 10, sigY + 8);
        doc.text(`अधिकृत डेअरी रेकॉर्ड व मंजुरी शिक्का`, margin + colWidth * 2 + 20, sigY + 8);
      }

      // Universal Running Footer on all pages
      doc.setFontSize(7);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `प्रोक्युअर डायरी | पृष्ठ ${i} पैकी ${totalPages} | रूट: ${routeFilter} | कालावधी: ${dateRangeLabel}`,
        margin,
        pageHeight - 8
      );
      doc.text(`गोपनीय दुग्ध संकलन नोंदवही (Official Dairy CRM Record)`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    // Save File with descriptive parameters
    const safeRoute = routeFilter.replace(/[^a-zA-Z0-9_\u0900-\u097F-]/g, '_').substring(0, 25);
    const fileName = `Procure_Diary_${category}_${safeRoute}_${reportDate}.pdf`;
    doc.save(fileName);
  },

  /**
   * Daily Field Diary & Call Operations PDF Report
   */
  generateDailyCallReport: (options: CustomPDFReportOptions) => {
    PDFService.generateCustomPDFReport({
      ...options,
      category: 'calls',
    });
  },

  /**
   * Export Full Farmer & Gavali Master Directory with FSSAI & Milk Parameters to PDF
   */
  exportFarmerDirectoryPDF: (farmers: Farmer[], filterRoute: string = 'सर्व रूट्स') => {
    PDFService.generateCustomPDFReport({
      category: 'farmers',
      title: 'गवळी मास्टर डिरेक्टरी व FSSAI परवाना नोंदवही (Gavali Master Directory)',
      farmers,
      routeFilter: filterRoute,
      orientation: 'landscape',
    });
  },

  exportCallsToPDF: (calls: CallRecord[], dateRangeLabel?: string) => {
    PDFService.generateCustomPDFReport({
      category: 'calls',
      title: `दैनिक कॉल रोजनिशी व संवाद अहवाल (${dateRangeLabel || 'सर्व कालावधी'})`,
      calls,
      dateRangeLabel: dateRangeLabel || 'सर्व कालावधी',
      orientation: 'portrait',
    });
  },
};
