const API_URL = 'http://localhost:5000/api/v1';

async function verify() {
    const timestamp = Date.now();
    const patientEmail = `patient_${timestamp}@example.com`;
    const ownerEmail = `owner_${timestamp}@example.com`;
    const password = 'Password@123';

    console.log('--- TESTING PATIENT REGISTRATION ---');
    try {
        const patientReg = await fetch(`${API_URL}/auth/register-patient`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Patient',
                email: patientEmail,
                phone: `1234567${timestamp.toString().slice(-3)}`,
                password
            })
        });
        
        const data = await patientReg.json();
        const setCookie = patientReg.headers.get('set-cookie') || 'None';
        
        console.log('Patient Registration Status:', patientReg.status);
        console.log('Patient Registration Body has refreshToken:', !!data.data.refreshToken);
        console.log('Patient Registration Cookies:', setCookie);
        
        if (data.data.refreshToken) {
            console.log('✅ PASS: Patient got refreshToken in body');
        } else {
            console.log('❌ FAIL: Patient MISSING refreshToken in body');
        }
    } catch (e: any) {
        console.error('Patient Reg Error:', e.message);
    }

    console.log('\n--- TESTING OWNER REGISTRATION ---');
    let ownerAccessToken = '';
    try {
        const ownerReg = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Owner',
                email: ownerEmail,
                phone: `9876543${timestamp.toString().slice(-3)}`,
                password
            })
        });
        
        const data = await ownerReg.json();
        const setCookie = ownerReg.headers.get('set-cookie') || '';
        
        console.log('Owner Registration Status:', ownerReg.status);
        console.log('Owner Registration Body has refreshToken:', !!data.data.refreshToken);
        console.log('Owner Registration Cookies:', setCookie);
        
        ownerAccessToken = data.data.accessToken;
        const hasRefreshTokenCookie = setCookie.includes('refreshToken=');
        
        if (!data.data.refreshToken && hasRefreshTokenCookie) {
            console.log('✅ PASS: Owner got refreshToken in cookie and NOT in body');
        } else {
            console.log('❌ FAIL: Owner token delivery incorrect');
        }
    } catch (e: any) {
        console.error('Owner Reg Error:', e.message);
    }

    if (ownerAccessToken) {
        console.log('\n--- TESTING CLINIC CREATION ---');
        try {
            const clinicRes = await fetch(`${API_URL}/clinics`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ownerAccessToken}`
                },
                body: JSON.stringify({
                    name: 'Test Clinic',
                    address: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    country: 'Test Country',
                    phone: `555000${timestamp.toString().slice(-4)}`,
                    email: `clinic_${timestamp}@example.com`
                })
            });

            const clinicData = await clinicRes.json();
            console.log('Clinic Creation Status:', clinicRes.status);
            console.log('Clinic Creation Response:', JSON.stringify(clinicData, null, 2));

            if (clinicRes.status === 201) {
                console.log('✅ PASS: Clinic created successfully');
            } else {
                console.log('❌ FAIL: Clinic creation failed');
            }
        } catch (e: any) {
            console.error('Clinic Creation Error:', e.message);
        }
    }
}

verify();
