const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZXB2d29rdmFkYXl5aWNnZHB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYxNzAyOCwiZXhwIjoyMDk3MTkzMDI4fQ.fgwfLqr7OfVcFa15PBz6bBHgwIlssZ7Hl33lFYQuvRA';
const url = 'https://wnepvwokvadayyicgdpy.supabase.co/rest/v1/complaints?assigned_department_code=eq.ELECTRICAL_MAINT&select=id,title,status,assigned_staff_id';

async function main() {
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': apiKey,
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}
main();
