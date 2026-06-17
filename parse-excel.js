const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

try {
    const filePath = path.join(__dirname, 'Roll List - B.Tech Batch-2025 (1).xlsx');
    console.log("Reading file:", filePath);
    
    // Read the file as a buffer first to avoid path issues with xlsx
    const buffer = fs.readFileSync(filePath);
    
    // Parse the buffer
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Get JSON data
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // Output the first 5 rows to a JSON file so I can read it!
    fs.writeFileSync('excel-preview.json', JSON.stringify({
        totalRows: data.length,
        columns: data[0],
        rows: data.slice(1, 6)
    }, null, 2));
    
    console.log("Success! Preview written to excel-preview.json");
} catch (err) {
    console.error("Error parsing excel:", err);
}
