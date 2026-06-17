const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('Roll List - B.Tech Batch-2025 (1).xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log("Headers:", data[0]);
console.log("Row 1:", data[1]);
console.log("Row 2:", data[2]);
console.log("Total rows:", data.length);
