import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        let bucket = formData.get('bucket') as string | null;

        if (!bucket) {
            bucket = 'complaints';
        }

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const supabase = getSupabase();
        const buffer = await file.arrayBuffer();
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const { data, error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
            contentType: file.type,
        });

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 });
        }

        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);

        return NextResponse.json({ success: true, storagePath: data.path, signedUrl: publicData.publicUrl });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
