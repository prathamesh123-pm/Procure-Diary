import * as XLSX from 'xlsx';
import { Farmer, CallRecord, PendingTask, FollowUpItem, RouteItem } from '../types';

export const ExcelService = {
  // Export Calls to Excel
  exportCallsToExcel: (calls: CallRecord[], filename = 'Dairy_Call_Register.xlsx') => {
    const data = calls.map((c, index) => ({
      'Sr No': index + 1,
      'Date': c.date,
      'Time': c.time,
      'Type': c.type.toUpperCase(),
      'Farmer Code': c.farmerCode,
      'Farmer Name': c.farmerName,
      'Mobile Number': c.mobileNumber,
      'Route': c.route,
      'Village': c.village,
      'Purpose': c.callPurpose,
      'Status': c.callStatus,
      'Discussion': c.discussion,
      'Information Given': c.informationGiven,
      'Pending Work': c.pendingWork || '-',
      'Follow-Up Date': c.followUpDate || '-',
      'Priority': c.priority,
      'Officer Name': c.officerName,
      'Duration (Sec)': c.callDuration,
      'AI Summary': c.aiSummary || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Call_Register');
    XLSX.writeFile(wb, filename);
  },

  // Export Farmers to Excel with full FSSAI, Milk profile and banking details
  exportFarmersToExcel: (farmers: Farmer[], filename = 'Dairy_Gavali_Master_Directory.xlsx') => {
    const data = farmers.map((f, index) => {
      const tenDayEst = (f.dailyMilkQuantity * (f.currentRate || 39.5) * 10).toFixed(0);
      return {
        'Sr No': index + 1,
        'Gavali Code': f.farmerCode,
        'Gavali / Producer Name': f.farmerName,
        'Mobile Number': f.mobileNumber,
        'Alternate Mobile': f.alternateNumber || '-',
        'Village': f.village,
        'Route': f.route,
        'Collection Center': f.collectionCenter,
        'Milk Type': f.milkType,
        'Daily Milk Volume (L)': f.dailyMilkQuantity,
        'Morning Milk (L)': f.morningMilkQty || '-',
        'Evening Milk (L)': f.eveningMilkQty || '-',
        'Cow Milk (L)': f.cowLitres || (f.milkType === 'Cow' ? f.dailyMilkQuantity : '-'),
        'Cow Rate (₹/L)': f.cowRate || (f.milkType === 'Cow' ? f.currentRate : '-'),
        'Buffalo Milk (L)': f.buffaloLitres || (f.milkType === 'Buffalo' ? f.dailyMilkQuantity : '-'),
        'Buffalo Rate (₹/L)': f.buffaloRate || (f.milkType === 'Buffalo' ? f.currentRate : '-'),
        'Avg FAT %': f.avgFat || 3.8,
        'Avg SNF %': f.avgSNF || 8.5,
        'Rate (₹/L)': f.currentRate || 39.5,
        '10-Day Est Payout (₹)': Number(tenDayEst),
        'FSSAI Reg Number': f.fssaiNumber || 'Not Registered',
        'FSSAI Status': f.fssaiStatus || 'Active',
        'FSSAI Expiry Date': f.fssaiExpiryDate || '-',
        'Cattle Count': f.cattleCount || '-',
        'Bank Name': f.bankName || '-',
        'Account Number': f.bankAccountNumber || '-',
        'IFSC Code': f.ifscCode || '-',
        'Status': f.status,
        'Remarks': f.remarks || '-',
        'Address': f.address || '-',
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gavali_Master');
    XLSX.writeFile(wb, filename);
  },

  // Export Comprehensive Master Workbook
  exportMasterWorkbook: (
    calls: CallRecord[],
    farmers: Farmer[],
    tasks: PendingTask[],
    followUps: FollowUpItem[],
    routes: RouteItem[]
  ) => {
    const wb = XLSX.utils.book_new();

    // Calls sheet
    const callData = calls.map((c, i) => ({
      '#': i + 1,
      Date: c.date,
      Time: c.time,
      Type: c.type,
      'Farmer Code': c.farmerCode,
      'Farmer Name': c.farmerName,
      Mobile: c.mobileNumber,
      Route: c.route,
      Purpose: c.callPurpose,
      Status: c.callStatus,
      Discussion: c.discussion,
      'Follow-Up Date': c.followUpDate || '',
      Officer: c.officerName,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(callData), 'Calls_Log');

    // Farmers sheet
    const farmerData = farmers.map((f, i) => ({
      '#': i + 1,
      'Farmer Code': f.farmerCode,
      'Farmer Name': f.farmerName,
      Mobile: f.mobileNumber,
      Village: f.village,
      Route: f.route,
      'Milk Type': f.milkType,
      'Daily Qty (L)': f.dailyMilkQuantity,
      'Avg FAT': f.avgFat || 3.8,
      'Avg SNF': f.avgSNF || 8.5,
      'Rate (₹)': f.currentRate || 39.5,
      'FSSAI No': f.fssaiNumber || '-',
      Status: f.status,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(farmerData), 'Farmers_Master');

    // Tasks sheet
    const taskData = tasks.map((t, i) => ({
      '#': i + 1,
      'Work Name': t.workName,
      Farmer: t.farmerName || '',
      Route: t.route,
      'Assigned To': t.assignedToName,
      'Due Date': t.dueDate,
      Priority: t.priority,
      Status: t.status,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taskData), 'Pending_Tasks');

    // Follow-ups sheet
    const followData = followUps.map((fl, i) => ({
      '#': i + 1,
      'Farmer Name': fl.farmerName,
      Mobile: fl.mobileNumber,
      Route: fl.route,
      'Scheduled Date': fl.scheduledDate,
      Reason: fl.reason,
      Priority: fl.priority,
      Status: fl.status,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(followData), 'Follow_Ups');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Procure_Diary_Executive_Export_${dateStr}.xlsx`);
  },

  // Download Sample Import Template
  downloadFarmerTemplate: () => {
    const templateData = [
      {
        'Farmer Code': 'G-201',
        'Farmer Name': 'बाळू मारुती पाटील (Balu Patil)',
        'Mobile Number': '9822112233',
        'Alternate Number': '9422998877',
        'Village': 'Madhavnagar',
        'Route': 'RT-101',
        'Collection Center': 'Madhavnagar Center 1',
        'Milk Type (Cow/Buffalo/Both)': 'Cow',
        'Daily Milk Quantity (Ltr)': 35,
        'Morning Milk': 20,
        'Evening Milk': 15,
        'FAT %': 3.8,
        'SNF %': 8.5,
        'FSSAI Number': '21523098000123',
        'Status (Active/Irregular/Stopped)': 'Active',
        'Remarks': 'HF Cow owner, regular supplier',
        'Address': 'Near Grampanchayat, Madhavnagar',
      },
      {
        'Farmer Code': 'G-202',
        'Farmer Name': 'सखाराम नामदेव जाधव (Sakharam Jadhav)',
        'Mobile Number': '9890123450',
        'Alternate Number': '',
        'Village': 'Walwa',
        'Route': 'RT-102',
        'Collection Center': 'Walwa Gram Dairy',
        'Milk Type (Cow/Buffalo/Both)': 'Buffalo',
        'Daily Milk Quantity (Ltr)': 20,
        'Morning Milk': 11,
        'Evening Milk': 9,
        'FAT %': 6.5,
        'SNF %': 9.0,
        'FSSAI Number': '21523098000456',
        'Status (Active/Irregular/Stopped)': 'Active',
        'Remarks': 'Murrah buffalo herd',
        'Address': 'Walwa Kasaba',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gavali_Farmer_Template');
    XLSX.writeFile(wb, 'Procure_Diary_Gavali_Import_Template.xlsx');
  },

  // Parse Uploaded Excel File
  parseFarmersFromExcel: async (file: File): Promise<Partial<Farmer>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

          const parsedFarmers: Partial<Farmer>[] = rawJson.map((row, idx) => {
            const milkTypeRaw = String(row['Milk Type (Cow/Buffalo/Both)'] || row['Milk Type'] || 'Cow').trim();
            const milkType = milkTypeRaw.toLowerCase().includes('buf')
              ? 'Buffalo'
              : milkTypeRaw.toLowerCase().includes('both')
              ? 'Both'
              : 'Cow';

            const statusRaw = String(row['Status (Active/Irregular/Stopped)'] || row['Status'] || 'Active').trim();
            const status = statusRaw.toLowerCase().includes('stop')
              ? 'Stopped'
              : statusRaw.toLowerCase().includes('irreg')
              ? 'Irregular'
              : 'Active';

            return {
              id: `F-IMP-${Date.now()}-${idx}`,
              farmerCode: String(row['Farmer Code'] || `F-${Date.now().toString().slice(-4)}${idx}`).trim(),
              farmerName: String(row['Farmer Name'] || row['Name'] || `Farmer ${idx + 1}`).trim(),
              mobileNumber: String(row['Mobile Number'] || row['Mobile'] || '').trim(),
              alternateNumber: String(row['Alternate Number'] || '').trim(),
              village: String(row['Village'] || 'Sangli').trim(),
              route: String(row['Route'] || 'RT-101').trim(),
              collectionCenter: String(row['Collection Center'] || row['Center'] || 'Main Center').trim(),
              milkType,
              dailyMilkQuantity: Number(row['Daily Milk Quantity (Ltr)'] || row['Daily Milk'] || 10),
              morningMilkQty: Number(row['Morning Milk'] || Math.round(Number(row['Daily Milk Quantity (Ltr)'] || 10) * 0.55)),
              eveningMilkQty: Number(row['Evening Milk'] || Math.round(Number(row['Daily Milk Quantity (Ltr)'] || 10) * 0.45)),
              avgFat: Number(row['FAT %'] || (milkType === 'Cow' ? 3.8 : 6.5)),
              avgSNF: Number(row['SNF %'] || (milkType === 'Cow' ? 8.5 : 9.0)),
              fssaiNumber: String(row['FSSAI Number'] || row['FSSAI'] || '').trim(),
              fssaiStatus: 'Active',
              status,
              remarks: String(row['Remarks'] || 'Imported from Excel batch').trim(),
              address: String(row['Address'] || '').trim(),
              isFavorite: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });

          resolve(parsedFarmers);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsArrayBuffer(file);
    });
  },

  // Export Master Rate Chart to Multi-Sheet Excel Workbook
  exportRateChartToExcel: (rateChart: any, filename = 'Master_Milk_Rate_Chart.xlsx') => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: General Parameters
    const summaryData = [
      { Parameter: 'Rate Chart Version', Value: rateChart.versionTag || `v${rateChart.version}` },
      { Parameter: 'Effective Date', Value: rateChart.effectiveDate },
      { Parameter: 'Last Updated At', Value: rateChart.updatedAt },
      { Parameter: 'Updated By', Value: `${rateChart.updatedBy?.name || 'Admin'} (${rateChart.updatedBy?.role || 'Admin'})` },
      { Parameter: 'Revision Reason', Value: rateChart.changeReason || 'Official Rate Revision' },
      { Parameter: 'Cow Base Rate (₹/L)', Value: rateChart.cowRateConfig.baseRate },
      { Parameter: 'Cow Base Fat (%)', Value: rateChart.cowRateConfig.baseFat },
      { Parameter: 'Cow Base SNF (%)', Value: rateChart.cowRateConfig.baseSnf },
      { Parameter: 'Cow Incentive (₹/L)', Value: rateChart.cowRateConfig.incentivePerLitre },
      { Parameter: 'Buffalo Base Rate (₹/L)', Value: rateChart.buffaloRateConfig.baseRate },
      { Parameter: 'Buffalo Base Fat (%)', Value: rateChart.buffaloRateConfig.baseFat },
      { Parameter: 'Buffalo Base SNF (%)', Value: rateChart.buffaloRateConfig.baseSnf },
      { Parameter: 'Buffalo Incentive (₹/L)', Value: rateChart.buffaloRateConfig.incentivePerLitre },
      { Parameter: 'Clean Milk Bonus (₹/L)', Value: rateChart.qualityIncentives.cleanlinessBonus },
      { Parameter: 'Chilled Milk Bonus (₹/L)', Value: rateChart.qualityIncentives.coolingChillingBonus },
      { Parameter: 'A2 Desi Cow Bonus (₹/L)', Value: rateChart.qualityIncentives.organicA2Bonus },
      { Parameter: 'Transport Deduction (₹/L)', Value: rateChart.deductions.transportChargePerLitre },
      { Parameter: 'Cattle Feed Fund Levy (₹/L)', Value: rateChart.deductions.cattleFeedLevyPerLitre },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Rate_Summary');

    // Sheet 2: Cow Fat vs SNF Matrix
    const cowMatrixData: any[] = [];
    const cowFats = [3.0, 3.2, 3.4, 3.5, 3.6, 3.8, 4.0, 4.2, 4.5];
    const cowSnfs = [8.0, 8.2, 8.4, 8.5, 8.6, 8.8, 9.0];

    cowFats.forEach(f => {
      const row: any = { 'Fat %': f.toFixed(1) };
      cowSnfs.forEach(s => {
        const fatDiff = Math.round((f - rateChart.cowRateConfig.baseFat) * 10);
        const snfDiff = Math.round((s - rateChart.cowRateConfig.baseSnf) * 10);
        const fatAdj = fatDiff >= 0 ? fatDiff * rateChart.cowRateConfig.fatIncrStep : fatDiff * rateChart.cowRateConfig.fatDecrStep;
        const snfAdj = snfDiff >= 0 ? snfDiff * rateChart.cowRateConfig.snfIncrStep : snfDiff * rateChart.cowRateConfig.snfDecrStep;
        const net = Math.max(0, rateChart.cowRateConfig.baseRate + fatAdj + snfAdj + rateChart.cowRateConfig.incentivePerLitre);
        row[`SNF ${s.toFixed(1)}%`] = net.toFixed(2);
      });
      cowMatrixData.push(row);
    });
    const wsCow = XLSX.utils.json_to_sheet(cowMatrixData);
    XLSX.utils.book_append_sheet(wb, wsCow, 'Cow_Rate_Matrix');

    // Sheet 3: Buffalo Fat vs SNF Matrix
    const buffaloMatrixData: any[] = [];
    const buffFats = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
    const buffSnfs = [8.5, 8.8, 9.0, 9.2, 9.5];

    buffFats.forEach(f => {
      const row: any = { 'Fat %': f.toFixed(1) };
      buffSnfs.forEach(s => {
        const fatDiff = Math.round((f - rateChart.buffaloRateConfig.baseFat) * 10);
        const snfDiff = Math.round((s - rateChart.buffaloRateConfig.baseSnf) * 10);
        const fatAdj = fatDiff >= 0 ? fatDiff * rateChart.buffaloRateConfig.fatIncrStep : fatDiff * rateChart.buffaloRateConfig.fatDecrStep;
        const snfAdj = snfDiff >= 0 ? snfDiff * rateChart.buffaloRateConfig.snfIncrStep : snfDiff * rateChart.buffaloRateConfig.snfDecrStep;
        const net = Math.max(0, rateChart.buffaloRateConfig.baseRate + fatAdj + snfAdj + rateChart.buffaloRateConfig.incentivePerLitre);
        row[`SNF ${s.toFixed(1)}%`] = net.toFixed(2);
      });
      buffaloMatrixData.push(row);
    });
    const wsBuffalo = XLSX.utils.json_to_sheet(buffaloMatrixData);
    XLSX.utils.book_append_sheet(wb, wsBuffalo, 'Buffalo_Rate_Matrix');

    // Sheet 4: Volume Bonus Slabs
    if (rateChart.volumeSlabs && rateChart.volumeSlabs.length > 0) {
      const slabsData = rateChart.volumeSlabs.map((s: any, idx: number) => ({
        'Slab #': idx + 1,
        'Slab Name': s.slabName,
        'Min Litres': s.minLitres,
        'Max Litres': s.maxLitres > 10000 ? 'Unlimited' : s.maxLitres,
        'Bonus (₹/L)': s.bonusPerLitre,
      }));
      const wsSlabs = XLSX.utils.json_to_sheet(slabsData);
      XLSX.utils.book_append_sheet(wb, wsSlabs, 'Volume_Bonus_Slabs');
    }

    XLSX.writeFile(wb, filename);
  },
};
