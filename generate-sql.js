const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const filePath = path.join(__dirname, 'Roll List - B.Tech Batch-2025 (1).xlsx');
const buffer = fs.readFileSync(filePath);
const workbook = xlsx.read(buffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// The first row is the title "Roll List...". The second row is headers. 
// So actual data starts from index 2.
const rows = data.slice(2).filter(r => r[1]); // Ensure Roll No exists

let sql = `-- Auto-generated SQL for inserting students\n\n`;

const BATCH_SIZE = 100; // Chunk the inserts so Supabase SQL editor doesn't crash on huge statements
const HASH = '$2a$10$wK1m.XgU.dXXo4G2H/bFMOyZ7K/62fP3d1Lh4bA2d5t9j.Xz2e3B.';

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    
    const students = batch.map(row => {
        const rollNo = String(row[1]).trim();
        const name = (row[2] || 'Student').replace(/'/g, "''").trim();
        const branch = (row[4] || row[3] || 'Unknown').replace(/'/g, "''").trim(); // Full Branch Name
        const email = `stu${rollNo}@nitj.ac.in`.toLowerCase(); // Avoid conflict with admin if roll is simple
        return {
            id: crypto.randomUUID(),
            rollNo,
            name,
            email,
            branch
        };
    });

    let userVals = students.map(u => `('${u.id}', '${u.email}', '${u.name}', '${HASH}', 'STUDENT', TRUE)`).join(',\n');
    sql += `INSERT INTO users (id, email, name, password_hash, role, is_active) VALUES\n${userVals}\nON CONFLICT (email) DO NOTHING;\n\n`;

    let studentVals = students.map(u => `('${u.id}', '${u.rollNo}', '${u.branch}', 1, 0)`).join(',\n');
    sql += `INSERT INTO students (user_id, roll_number, department, year, rating) VALUES\n${studentVals}\nON CONFLICT (roll_number) DO NOTHING;\n\n`;
}

fs.writeFileSync('insert_students.sql', sql);
console.log(`Successfully parsed ${rows.length} students and generated insert_students.sql`);
