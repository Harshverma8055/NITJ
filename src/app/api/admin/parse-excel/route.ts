import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'Roll List - B.Tech Batch-2025 (1).xlsx');
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        const buffer = fs.readFileSync(filePath);
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        
        // Return first 5 rows to understand structure
        return NextResponse.json({ rows: data.slice(0, 5) });
    } catch (err: any) {
        console.error("Parse excel error:", err);
        return NextResponse.json({ error: err.toString(), stack: err.stack }, { status: 200 });
    }
}
