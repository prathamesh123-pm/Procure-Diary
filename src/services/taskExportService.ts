import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Task } from '../types/task';
import { setupPdfUnicodeFont, UNICODE_FONT_FAMILY } from './pdfUnicodeHelper';

export class TaskExportService {
  /**
   * Export Full Task Dossier to PDF (Including Work Logs, Timeline, Completion Report & Audit Log)
   * With 100% Full Unicode Marathi (Devanagari) & English Rendering
   */
  static exportTaskToPDF(task: Task, language: 'mr' | 'en' = 'mr'): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });

    const isMarathi = language === 'mr';

    // 1. Embed and configure Unicode Devanagari Font (Noto Sans Devanagari)
    setupPdfUnicodeFont(doc);

    // Page styling & Header
    doc.setFillColor(5, 150, 105); // Emerald-600
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14.5);
    doc.setFont(UNICODE_FONT_FAMILY, 'bold');
    doc.text(
      isMarathi
        ? 'प्रोक्युअर डायरी - दूध संकलन व्यवस्थापन प्रणाली'
        : 'PROCURE DIARY - MILK PROCUREMENT CRM',
      14,
      11
    );

    doc.setFontSize(9);
    doc.setFont(UNICODE_FONT_FAMILY, 'normal');
    doc.text(
      isMarathi
        ? `कार्य व रोजनिशी पूर्णता इतिहास अहवाल (Task Dossier) - ${task.id}`
        : `Task Lifecycle & Work Log History Dossier - ${task.id}`,
      14,
      19
    );

    // Current Date Timestamp
    doc.setFontSize(7.5);
    doc.text(
      `दिनांक: ${new Date().toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      140,
      19
    );

    // Section 1: Task Core Overview
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont(UNICODE_FONT_FAMILY, 'bold');
    doc.text(
      isMarathi
        ? '१. कामाचा तपशील व गवळी माहिती (Task & Gavali Overview)'
        : '1. TASK OVERVIEW & GAVALI DETAILS',
      14,
      36
    );

    const taskDetails = isMarathi
      ? [
          ['टास्क आयडी (ID)', task.id, 'स्थिती (Status)', task.status],
          ['कामाचा विषय (Title)', task.taskTitle, 'प्राधान्य (Priority)', task.priority],
          ['प्रवर्ग (Category)', task.taskCategory, 'रूट (Route)', task.route],
          ['गवळी नाव (Gavali)', `${task.relatedGavali} (${task.gavaliCode})`, 'गाव (Village)', task.village],
          ['मोबाईल नंबर (Mobile)', task.mobileNumber, 'मुदत (Due Date)', task.dueDate],
          ['नोंदणीकर्ता (Creator)', task.createdByName, 'नोंद दिनांक (Created)', `${task.createdDate} ${task.createdTime}`],
          ['अधिकारी (Assigned)', task.assignedToName, 'फॉलो-अप तारीख', task.followUpDate || 'लागू नाही'],
        ]
      : [
          ['Task ID', task.id, 'Status', task.status],
          ['Task Title', task.taskTitle, 'Priority', task.priority],
          ['Category', task.taskCategory, 'Route', task.route],
          ['Gavali Name', `${task.relatedGavali} (${task.gavaliCode})`, 'Village', task.village],
          ['Mobile Number', task.mobileNumber, 'Due Date', task.dueDate],
          ['Created By', task.createdByName, 'Created Date', `${task.createdDate} ${task.createdTime}`],
          ['Assigned Officer', task.assignedToName, 'Follow-up Date', task.followUpDate || 'None'],
        ];

    autoTable(doc, {
      startY: 40,
      body: taskDetails,
      theme: 'grid',
      styles: {
        font: UNICODE_FONT_FAMILY,
        fontStyle: 'normal',
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { font: UNICODE_FONT_FAMILY, fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 38 },
        1: { cellWidth: 57 },
        2: { font: UNICODE_FONT_FAMILY, fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 38 },
        3: { cellWidth: 49 },
      },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 7;

    // Task Notes
    if (task.notes) {
      doc.setFontSize(8.5);
      doc.setFont(UNICODE_FONT_FAMILY, 'bold');
      doc.text(
        isMarathi ? 'कामाच्या मूळ सूचना व पूर्वइतिहास (Initial Notes):' : 'Initial Task Instructions / Notes:',
        14,
        currentY
      );
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.setFontSize(8);
      const splitNotes = doc.splitTextToSize(task.notes, 180);
      doc.text(splitNotes, 14, currentY + 4);
      currentY += splitNotes.length * 4 + 7;
    }

    // Section 2: Chronological Work Logs (रोजनिशी)
    doc.setFontSize(11);
    doc.setFont(UNICODE_FONT_FAMILY, 'bold');
    doc.text(
      isMarathi
        ? `२. दैनंदिन रोजनिशी व संवाद इतिहास (Work Log History - ${task.workLogs.length} नोंदी)`
        : `2. WORK LOG HISTORY (${task.workLogs.length} Entries)`,
      14,
      currentY
    );

    if (task.workLogs.length === 0) {
      doc.setFontSize(8);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.text(
        isMarathi ? 'अद्याप कोणतीही रोजनिशी नोंद उपलब्ध नाही.' : 'No work logs added yet.',
        14,
        currentY + 5
      );
      currentY += 10;
    } else {
      const logsData = task.workLogs.map((log, idx) => [
        `#${idx + 1}\n${log.date}\n${log.time}`,
        `${log.workDescription}\n\n• माध्यम: ${[
          log.callMade ? (log.isIncoming ? 'आवक कॉल' : 'जावक कॉल') : null,
          log.visitCompleted ? 'प्रत्यक्ष भेट' : null,
          log.whatsappSent ? 'व्हॉट्सअ‍ॅप' : null,
          log.smsSent ? 'एसएमएस' : null,
        ]
          .filter(Boolean)
          .join(', ') || 'सामान्य'}\n• दिलेली माहिती: ${log.informationGiven || '-'}\n• मिळालेली माहिती: ${
          log.informationReceived || '-'
        }`,
        `• प्रलंबित: ${log.pendingWork || '-'}\n• पुढील कृती: ${log.nextAction || '-'}\n• पुढील फॉलो-अप: ${
          log.nextFollowUpDate || '-'
        }`,
        log.createdBy.name,
      ]);

      autoTable(doc, {
        startY: currentY + 3,
        head: [
          isMarathi
            ? ['दिनांक / वेळ', 'केलेले काम व माहिती देवाणघेवाण', 'प्रलंबित काम / पुढील कृती', 'अधिकारी']
            : ['Date/Time', 'Work Done & Information Exchange', 'Pending / Next Action', 'Executive'],
        ],
        body: logsData,
        theme: 'striped',
        headStyles: {
          font: UNICODE_FONT_FAMILY,
          fontStyle: 'bold',
          fillColor: [15, 118, 110],
          fontSize: 8,
          textColor: [255, 255, 255],
        },
        styles: {
          font: UNICODE_FONT_FAMILY,
          fontStyle: 'normal',
          fontSize: 7.2,
          cellPadding: 2.2,
          textColor: [30, 41, 59],
        },
        columnStyles: {
          0: { cellWidth: 24, font: UNICODE_FONT_FAMILY, fontStyle: 'bold' },
          1: { cellWidth: 86 },
          2: { cellWidth: 48 },
          3: { cellWidth: 24 },
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 7;
    }

    // Section 3: Task Timeline
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont(UNICODE_FONT_FAMILY, 'bold');
    doc.text(
      isMarathi
        ? `३. टप्पानिहाय घडामोडी टाइमलाइन (Activity Timeline - ${task.timeline.length} नोंदी)`
        : `3. STEP-BY-STEP ACTIVITY TIMELINE (${task.timeline.length} Events)`,
      14,
      currentY
    );

    const timelineData = task.timeline.map((item, idx) => [
      `${idx + 1}`,
      `${item.date} ${item.time}`,
      item.title,
      item.remarks || '-',
      item.user.name,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [
        isMarathi
          ? ['#', 'दिनांक व वेळ', 'घडामोड / कृती', 'तपशील व शेरा', 'अधिकारी']
          : ['#', 'Date & Time', 'Event / Activity', 'Details & Remarks', 'Officer'],
      ],
      body: timelineData,
      theme: 'grid',
      headStyles: {
        font: UNICODE_FONT_FAMILY,
        fontStyle: 'bold',
        fillColor: [51, 65, 85],
        fontSize: 8,
        textColor: [255, 255, 255],
      },
      styles: {
        font: UNICODE_FONT_FAMILY,
        fontStyle: 'normal',
        fontSize: 7.2,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 9, halign: 'center' },
        1: { cellWidth: 32 },
        2: { cellWidth: 54, font: UNICODE_FONT_FAMILY, fontStyle: 'bold' },
        3: { cellWidth: 62 },
        4: { cellWidth: 25 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 7;

    // Section 4: Completion Report Certificate (If Completed)
    if (task.completionReport) {
      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFillColor(236, 253, 245); // Emerald-50
      doc.rect(14, currentY, 182, 58, 'F');
      doc.setDrawColor(16, 185, 129);
      doc.rect(14, currentY, 182, 58, 'D');

      doc.setTextColor(6, 95, 70);
      doc.setFontSize(10.5);
      doc.setFont(UNICODE_FONT_FAMILY, 'bold');
      doc.text(
        isMarathi
          ? '४. अधिकृत कार्यपूर्तता अहवाल व निवारण प्रमाणपत्र (Task Completion Certificate)'
          : '4. FORMAL TASK COMPLETION CERTIFICATE & REPORT',
        20,
        currentY + 7
      );

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7.5);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.text(
        isMarathi
          ? `पूर्ण दिनांक: ${task.completionReport.completionDate} ${task.completionReport.completionTime}`
          : `Completion Date: ${task.completionReport.completionDate} ${task.completionReport.completionTime}`,
        20,
        currentY + 14
      );
      doc.text(
        isMarathi
          ? `पूर्ण करणारे अधिकारी: ${task.completionReport.completedBy.name}`
          : `Completed By: ${task.completionReport.completedBy.name}`,
        110,
        currentY + 14
      );

      doc.setFont(UNICODE_FONT_FAMILY, 'bold');
      doc.text(isMarathi ? 'शोधलेली समस्या:' : 'Problem Identified:', 20, currentY + 21);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.text(task.completionReport.problemIdentified, 55, currentY + 21);

      doc.setFont(UNICODE_FONT_FAMILY, 'bold');
      doc.text(isMarathi ? 'दिलेला तोडगा:' : 'Solution Provided:', 20, currentY + 28);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.text(task.completionReport.solutionProvided, 55, currentY + 28);

      doc.setFont(UNICODE_FONT_FAMILY, 'bold');
      doc.text(isMarathi ? 'प्रत्यक्ष केलेले काम:' : 'Final Work Done:', 20, currentY + 35);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.text(task.completionReport.finalWorkDone, 55, currentY + 35);

      doc.setFont(UNICODE_FONT_FAMILY, 'bold');
      doc.text(isMarathi ? 'अंतिम संकलन निकाल:' : 'Final Procurement Result:', 20, currentY + 42);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.text(task.completionReport.finalResult, 65, currentY + 42);

      doc.setFont(UNICODE_FONT_FAMILY, 'bold');
      doc.text(isMarathi ? 'पुढील शिफारस:' : 'Future Recommendation:', 20, currentY + 49);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.text(task.completionReport.nextRecommendation || (isMarathi ? 'काही नाही' : 'None'), 65, currentY + 49);

      currentY += 66;
    }

    // Section 5: Audit Trail
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(9.5);
    doc.setFont(UNICODE_FONT_FAMILY, 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(
      isMarathi
        ? `५. कायमस्वरूपी ऑडिट ट्रेल (Permanent Audit Trail - ${task.auditTrail.length} नोंदी)`
        : `5. PERMANENT AUDIT TRAIL (${task.auditTrail.length} Actions Logged)`,
      14,
      currentY
    );

    const auditData = task.auditTrail.map(a => [
      `${a.date} ${a.time}`,
      a.action.toUpperCase(),
      a.fieldChanged || '-',
      a.previousValue || '-',
      a.updatedValue || '-',
      `${a.user.name} (${a.device})`,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [
        isMarathi
          ? ['वेळ व दिनांक', 'कृती (Action)', 'बदललेला घटक', 'मागील मूल्य', 'नवीन मूल्य', 'वापरकर्ता / डिव्हाइस']
          : ['Timestamp', 'Action', 'Field', 'Previous', 'Updated Value', 'User / Device'],
      ],
      body: auditData,
      theme: 'plain',
      styles: {
        font: UNICODE_FONT_FAMILY,
        fontStyle: 'normal',
        fontSize: 6.5,
        cellPadding: 1.5,
        textColor: [71, 85, 105],
      },
      headStyles: {
        font: UNICODE_FONT_FAMILY,
        fontStyle: 'bold',
        fillColor: [241, 245, 249],
      },
    });

    // Universal running page numbers & footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(6.5);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `प्रोक्युअर डायरी | कार्य अहवाल ID: ${task.id} | पृष्ठ ${p} पैकी ${totalPages} | गवळी: ${task.relatedGavali}`,
        14,
        290
      );
      doc.text('गोपनीय दुग्ध संकलन दस्तऐवज (Confidential CRM Record)', 196, 290, { align: 'right' });
    }

    // Save File
    const safeGavali = task.relatedGavali.replace(/[^a-zA-Z0-9_\u0900-\u097F-]/g, '_').substring(0, 20);
    doc.save(`Task_Report_${task.id}_${safeGavali}.pdf`);
  }

  /**
   * Export List of Tasks to Master Excel
   */
  static exportTasksToExcel(tasks: Task[]): void {
    const mainRows = tasks.map(t => ({
      'Task ID': t.id,
      'Title': t.taskTitle,
      'Category': t.taskCategory,
      'Gavali Name': t.relatedGavali,
      'Gavali Code': t.gavaliCode,
      'Mobile': t.mobileNumber,
      'Route': t.route,
      'Village': t.village,
      'Priority': t.priority,
      'Status': t.status,
      'Due Date': t.dueDate,
      'Follow-up Date': t.followUpDate || '',
      'Created Date': `${t.createdDate} ${t.createdTime}`,
      'Created By': t.createdByName,
      'Assigned To': t.assignedToName,
      'Total Work Logs': t.workLogs.length,
      'Total Timeline Events': t.timeline.length,
      'Tags': t.tags.join(', '),
      'Notes': t.notes,
      'Completed': t.completionReport ? 'Yes' : 'No',
      'Completion Date': t.completionReport?.completionDate || '',
      'Completion Result': t.completionReport?.finalResult || '',
    }));

    // Flatten all work logs for secondary sheet
    const workLogRows: any[] = [];
    tasks.forEach(t => {
      t.workLogs.forEach((l, idx) => {
        workLogRows.push({
          'Task ID': t.id,
          'Task Title': t.taskTitle,
          'Gavali': t.relatedGavali,
          'Log #': idx + 1,
          'Date': l.date,
          'Time': l.time,
          'Work Description': l.workDescription,
          'Call Made': l.callMade ? 'Yes' : 'No',
          'Visit Completed': l.visitCompleted ? 'Yes' : 'No',
          'WhatsApp Sent': l.whatsappSent ? 'Yes' : 'No',
          'Info Given': l.informationGiven || '',
          'Info Received': l.informationReceived || '',
          'Pending Work': l.pendingWork || '',
          'Next Action': l.nextAction || '',
          'Next Follow-up': l.nextFollowUpDate || '',
          'Executive': l.createdBy.name,
        });
      });
    });

    const wb = XLSX.utils.book_new();
    const wsTasks = XLSX.utils.json_to_sheet(mainRows);
    const wsLogs = XLSX.utils.json_to_sheet(workLogRows);

    XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks Master');
    XLSX.utils.book_append_sheet(wb, wsLogs, 'Work Logs History');

    const fileName = `Procure_Diary_Tasks_Master_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Browser Print Helper
   */
  static printTask(_task: Task): void {
    window.print();
  }
}
