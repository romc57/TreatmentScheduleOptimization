import * as XLSX from 'xlsx';
import { validateSchedule } from './scheduleTransformer';

export const processExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Process each sheet as a caretaker
        const caregivers = workbook.SheetNames
          .map(sheetName => processCaretakerSheet(workbook, sheetName))
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name));

        // Validate caregiver data
        if (!validateSchedule(caregivers, 'caregiver')) {
          reject(new Error('Invalid caregiver data in Excel file'));
          return;
        }

        resolve(caregivers);
      } catch (error) {
        reject(new Error('Failed to process Excel file: ' + error.message));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

function processCaretakerSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (!rows.length) return null;

  const caretakerName = sheetName.trim();
  const days = rows[0].slice(1).map(day => day ? day.toString().trim() : '');
  if (!days.length) return null;

  const schedule = {};
  days.forEach(day => { schedule[day] = {}; });

  // Process each row (hour) and column (day)
  for (let r = 1; r < rows.length; r++) {
    const hour = rows[r][0]?.toString();
    if (!hour) continue;

    for (let c = 1; c < rows[r].length; c++) {
      const patient = rows[r][c];
      if (patient !== undefined && patient !== null && patient !== "") {
        const day = days[c - 1];
        if (day) {
          schedule[day][hour] = patient.toString().trim();
        }
      }
    }
  }

  return {
    name: caretakerName,
    schedule: schedule,
    role: caretakerName.match(/\((.*?)\)/)?.[1] || ''
  };
}
