import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProducerSurvey, SurveyDashboardMetrics } from '../types';
import { setupPdfUnicodeFont, UNICODE_FONT_FAMILY } from './pdfUnicodeHelper';

export const SurveyReportService = {
  /**
   * Export Producer Surveys to Microsoft Excel (.xlsx)
   */
  exportToExcel: (surveys: ProducerSurvey[], filename = 'Producer_Survey_Directory.xlsx') => {
    const rows = surveys.map((s, index) => ({
      'अ.क्र. (Sr No)': index + 1,
      'उत्पादक कोड (Producer Code)': s.producerCode,
      'उत्पादकाचे नाव (Producer Name)': s.producerName,
      'मोबाईल नंबर (Mobile)': s.mobileNumber,
      'पर्यायी नंबर (Alt Mobile)': s.alternateNumber || '-',
      'गाव (Village)': s.village,
      'तालुका (Taluka)': s.taluka,
      'जिल्हा (District)': s.district,
      'संपूर्ण पत्ता (Full Address)': s.fullAddress,
      'अक्षांश/रेखांश (GPS Lat, Long)': s.latitude && s.longitude ? `${s.latitude}, ${s.longitude}` : 'Not Recorded',
      'रूट (Route)': s.route,
      'लिंक केंद्र (Link Center)': s.linkCenter,
      'संकलन केंद्र (Collection Center)': s.collectionCenter,
      'दूध प्रकार (Milk Type)': s.milkType,
      'दैनिक दूध अंदाज (Daily Litres)': s.dailyMilkPotential || '-',
      'जनावरे संख्या (Cattle Count)': s.cattleCount || '-',
      'सर्वेक्षण दिनांक (Survey Date)': s.surveyDate,
      'सर्वेक्षक अधिकारी (Surveyed By)': s.surveyedBy,
      'सर्वेक्षण स्थिती (Survey Status)': s.surveyStatus,
      'ऑनलाइन डिव्हाइस स्थिती (Device Status)': s.deviceStatus,
      'डिव्हाइस इन्स्टॉलेशन दिनांक (Install Date)': s.deviceInstallationDate || '-',
      'डिव्हाइस सिरीयल नंबर (Serial No)': s.deviceSerialNumber || '-',
      'डिव्हाइस मॉडेल (Device Model)': s.deviceModel || '-',
      'उत्पादक स्थिती (Active/Inactive)': s.isActiveProducer ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)',
      'नोंद शेरा (Remarks)': s.surveyRemarks || '-',
      'क्लाउड सिंक (Cloud Synced)': s.syncedToCloud ? 'होय (Synced)' : 'प्रलंबित (Pending)',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Producer_Surveys');

    // Auto-size columns
    const maxCols = Object.keys(rows[0] || {}).length;
    const colWidths = Array(maxCols).fill({ wch: 20 });
    colWidths[1] = { wch: 15 }; // Code
    colWidths[2] = { wch: 28 }; // Name
    colWidths[8] = { wch: 35 }; // Address
    colWidths[24] = { wch: 30 }; // Remarks
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, filename);
  },

  /**
   * Export Producer Surveys to CSV (.csv)
   */
  exportToCSV: (surveys: ProducerSurvey[], filename = 'Producer_Surveys_Export.csv') => {
    const headers = [
      'Sr No',
      'Producer Code',
      'Producer Name',
      'Mobile Number',
      'Village',
      'Taluka',
      'District',
      'Full Address',
      'Latitude',
      'Longitude',
      'Route',
      'Link Center',
      'Collection Center',
      'Milk Type',
      'Daily Litres',
      'Cattle Count',
      'Survey Date',
      'Surveyed By',
      'Survey Status',
      'Device Status',
      'Device Install Date',
      'Device Serial No',
      'Producer Status',
      'Remarks',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const csvRows = [headers.map(escapeCsv).join(',')];

    surveys.forEach((s, idx) => {
      const row = [
        idx + 1,
        s.producerCode,
        s.producerName,
        s.mobileNumber,
        s.village,
        s.taluka,
        s.district,
        s.fullAddress,
        s.latitude || '',
        s.longitude || '',
        s.route,
        s.linkCenter,
        s.collectionCenter,
        s.milkType,
        s.dailyMilkPotential || '',
        s.cattleCount || '',
        s.surveyDate,
        s.surveyedBy,
        s.surveyStatus,
        s.deviceStatus,
        s.deviceInstallationDate || '',
        s.deviceSerialNumber || '',
        s.isActiveProducer ? 'Active' : 'Inactive',
        s.surveyRemarks || '',
      ];
      csvRows.push(row.map(escapeCsv).join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM for Marathi text compatibility in Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export to Microsoft Word Document (.doc format HTML compatible with MS Word)
   */
  exportToWord: (
    surveys: ProducerSurvey[],
    metrics: SurveyDashboardMetrics,
    title = 'दूध उत्पादक सर्वेक्षण अहवाल (Producer Survey Report)'
  ) => {
    const today = new Date().toLocaleDateString('mr-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Calibri', 'Mangal', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; }
          h1 { color: #047857; font-size: 18pt; text-align: center; margin-bottom: 4px; }
          h2 { color: #334155; font-size: 13pt; text-align: center; margin-top: 0; font-weight: normal; }
          .meta { font-size: 9.5pt; color: #64748b; margin-bottom: 20px; text-align: center; }
          .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .summary-table td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 10pt; }
          .summary-header { background-color: #ecfdf5; font-weight: bold; color: #065f46; }
          .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .data-table th { background-color: #047857; color: #ffffff; padding: 8px 6px; font-size: 9.5pt; border: 1px solid #047857; text-align: left; }
          .data-table td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 9pt; }
          .even { background-color: #f8fafc; }
          .status-badge { font-weight: bold; }
          .completed { color: #059669; }
          .pending { color: #d97706; }
          .revisit { color: #dc2626; }
          .device-installed { color: #2563eb; }
          .footer { margin-top: 40px; font-size: 10pt; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <h2>प्रोक्युअर डायरी - दूध संकलन व क्षेत्रीय व्यवस्थापन प्रणाली</h2>
        <div class="meta">
          अहवाल तारीख: <strong>${today}</strong> | एकूण नोंदणीकृत उत्पादक: <strong>${metrics.totalProducers}</strong> | क्लाउड सिंक: <strong>सुरक्षित व प्रमाणित</strong>
        </div>

        <table class="summary-table">
          <tr class="summary-header">
            <td>एकूण उत्पादक</td>
            <td>सर्वेक्षण पूर्ण</td>
            <td>सर्वेक्षण प्रलंबित</td>
            <td>पुन्हा भेट आवश्यक</td>
            <td>डिव्हाइस इन्स्टॉल</td>
            <td>डिव्हाइस प्रलंबित</td>
            <td>सक्रिय उत्पादक</td>
          </tr>
          <tr>
            <td><strong>${metrics.totalProducers}</strong></td>
            <td><strong style="color: #059669">${metrics.totalSurveysCompleted}</strong></td>
            <td><strong style="color: #d97706">${metrics.totalSurveysPending}</strong></td>
            <td><strong style="color: #dc2626">${metrics.totalSurveysRevisit}</strong></td>
            <td><strong style="color: #2563eb">${metrics.totalDeviceInstalled}</strong></td>
            <td><strong style="color: #ea580c">${metrics.totalDevicePending}</strong></td>
            <td><strong>${metrics.totalActiveProducers}</strong></td>
          </tr>
        </table>

        <h3>तपशीलवार उत्पादक सर्वेक्षण यादी (Detailed Producer List):</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>अ.क्र.</th>
              <th>कोड</th>
              <th>उत्पादक नाव</th>
              <th>मोबाईल</th>
              <th>गाव / तालुका</th>
              <th>रूट / संकलन केंद्र</th>
              <th>दूध</th>
              <th>दैनिक L</th>
              <th>सर्वेक्षक</th>
              <th>सर्वेक्षण स्थिती</th>
              <th>डिव्हाइस स्थिती</th>
              <th>GPS स्थान</th>
            </tr>
          </thead>
          <tbody>
            ${surveys
              .map(
                (s, i) => `
              <tr class="${i % 2 === 0 ? 'even' : ''}">
                <td>${i + 1}</td>
                <td><strong>${s.producerCode}</strong></td>
                <td>${s.producerName}</td>
                <td>${s.mobileNumber}</td>
                <td>${s.village} (${s.taluka})</td>
                <td>${s.route} - ${s.collectionCenter}</td>
                <td>${s.milkType}</td>
                <td>${s.dailyMilkPotential || '-'}L</td>
                <td>${s.surveyedBy}</td>
                <td class="status-badge ${s.surveyStatus === 'Completed' ? 'completed' : s.surveyStatus === 'Pending' ? 'pending' : 'revisit'}">${s.surveyStatus}</td>
                <td class="status-badge ${s.deviceStatus === 'Installed' ? 'device-installed' : ''}">${s.deviceStatus} ${s.deviceSerialNumber ? `(${s.deviceSerialNumber})` : ''}</td>
                <td>${s.latitude ? `${s.latitude}, ${s.longitude}` : 'No GPS'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <br><br>
        <table style="width: 100%; border: none; margin-top: 50px;">
          <tr>
            <td style="width: 50%; border: none; text-align: left;">
              ___________________________<br>
              <strong>संकलन / क्षेत्रीय अधिकारी स्वाक्षरी</strong><br>
              नाव: _____________________
            </td>
            <td style="width: 50%; border: none; text-align: right;">
              ___________________________<br>
              <strong>डेअरी मॅनेजर / अधिकृत स्वाक्षरी</strong><br>
              तारीख व शिक्का
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Producer_Survey_Report_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Generate A4 PDF Report using jsPDF and Unicode Devanagari font helper
   */
  exportToPDF: (
    surveys: ProducerSurvey[],
    metrics: SurveyDashboardMetrics,
    filterDescription = 'सर्व नोंदी (All Records)'
  ) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });

    setupPdfUnicodeFont(doc);
    const font = UNICODE_FONT_FAMILY;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Header Banner
    doc.setFillColor(4, 120, 87); // Emerald 700
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setFont(font);
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('प्रोक्युअर डायरी - दूध उत्पादक सर्वेक्षण व डिव्हाइस ट्रॅकिंग अहवाल', 14, 11);

    doc.setFontSize(9.5);
    doc.setTextColor(209, 250, 229);
    doc.text(`तारीख: ${new Date().toISOString().split('T')[0]}  |  फिल्टर: ${filterDescription}  |  क्लाउड सिंक स्टेटस: Live Cloud Sync Active`, 14, 18);

    // 2. Metrics Summary Bar
    doc.setFillColor(240, 253, 244); // Emerald 50
    doc.roundedRect(14, 28, pageWidth - 28, 14, 2, 2, 'F');
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(14, 28, pageWidth - 28, 14, 2, 2, 'S');

    doc.setFont(font);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    const summaryText = `एकूण उत्पादक: ${metrics.totalProducers}   |   सर्वेक्षण पूर्ण: ${metrics.totalSurveysCompleted}   |   सर्वेक्षण प्रलंबित: ${metrics.totalSurveysPending}   |   पुन्हा भेट: ${metrics.totalSurveysRevisit}   |   डिव्हाइस इन्स्टॉल: ${metrics.totalDeviceInstalled}   |   डिव्हाइस प्रलंबित: ${metrics.totalDevicePending}   |   सक्रिय: ${metrics.totalActiveProducers}`;
    doc.text(summaryText, 18, 37);

    // 3. Table Rows
    const tableData = surveys.map((s, idx) => [
      idx + 1,
      s.producerCode,
      s.producerName,
      s.mobileNumber,
      `${s.village}\n(${s.taluka})`,
      `${s.route}\n${s.collectionCenter}`,
      s.milkType,
      s.dailyMilkPotential ? `${s.dailyMilkPotential} L` : '-',
      s.surveyDate,
      s.surveyedBy.split('(')[0].trim(),
      s.surveyStatus === 'Completed' ? 'पूर्ण' : s.surveyStatus === 'Pending' ? 'प्रलंबित' : 'पुन्हा भेट',
      s.deviceStatus === 'Installed' ? `इन्स्टॉल (${s.deviceSerialNumber || 'Active'})` : s.deviceStatus === 'Pending' ? 'प्रलंबित' : 'आवश्यक नाही',
      s.latitude ? `${s.latitude}, ${s.longitude}` : 'No GPS',
    ]);

    autoTable(doc, {
      startY: 46,
      head: [
        [
          'अ.क्र.',
          'कोड',
          'उत्पादक नाव',
          'मोबाईल',
          'गाव (तालुका)',
          'रूट व केंद्र',
          'प्रकार',
          'दैनिक L',
          'दिनांक',
          'सर्वेक्षक',
          'सर्वेक्षण',
          'डिव्हाइस',
          'GPS स्थान',
        ],
      ],
      body: tableData,
      theme: 'grid',
      styles: {
        font: font,
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
        valign: 'middle',
      },
      headStyles: {
        fillColor: [4, 120, 87],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 16, fontStyle: 'bold' },
        2: { cellWidth: 36 },
        3: { cellWidth: 22 },
        4: { cellWidth: 24 },
        5: { cellWidth: 32 },
        6: { cellWidth: 14 },
        7: { cellWidth: 14 },
        8: { cellWidth: 18 },
        9: { cellWidth: 24 },
        10: { cellWidth: 18 },
        11: { cellWidth: 30 },
        12: { cellWidth: 26 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: data => {
        // Page footer
        doc.setFont(font);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `प्रोक्युअर डायरी | पृष्ठ क्र. ${doc.getNumberOfPages()} | जनरेट दिनांक: ${new Date().toLocaleString('mr-IN')}`,
          14,
          pageHeight - 8
        );
      },
    });

    doc.save(`Producer_Survey_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  },
};
