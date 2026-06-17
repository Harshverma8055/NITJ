const { SignJWT } = require('jose');
async function test() {
    const JWT_SECRET = new TextEncoder().encode('campus-discipline-secret-key-2024');
    const token = await new SignJWT({
        userId: 'f9f7c2ef-66a5-4b84-ad2d-92dd8a842ff3', // an existing user
        email: 'stu25102007@nitj.ac.in',
        name: 'AKSHARDEEP',
        role: 'STUDENT'
    }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('24h').sign(JWT_SECRET);

    const res = await fetch('http://localhost:3000/api/complaints', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `token=${token}`
        },
        body: JSON.stringify({
            title: 'Test Complaint Over 10 chars',
            description: 'This is a description that is over twenty characters long so it passes.',
            category: 'ELECTRICAL',
            zone: 'ACADEMIC_BLOCK',
            severity: 'MODERATE',
            is_emergency: false,
            is_anonymous: false
        })
    });
    console.log(res.status, await res.text());
}
test();
