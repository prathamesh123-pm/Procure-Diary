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
};
