const API_URL = 'http://localhost:5000/api/v1/auth';

async function diagnose() {
    const timestamp = Date.now();
    const ownerEmail = `diag_owner_${timestamp}@example.com`;
    const password = 'Password@123';

    console.log('--- DIAGNOSING OWNER REGISTRATION ---');
    try {
        const ownerReg = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Diag Owner',
                email: ownerEmail,
                phone: `0000000${timestamp.toString().slice(-3)}`,
                password
            })
        });
        
        const data = await ownerReg.json();
        console.log('Status:', ownerReg.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e: any) {
        console.error('Fetch Error:', e.message);
    }
}

diagnose();
