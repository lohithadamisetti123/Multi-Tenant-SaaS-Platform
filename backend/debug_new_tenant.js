const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';
const TIMESTAMP = Date.now();
const SUBDOMAIN = `test${TIMESTAMP}`;
const EMAIL = `admin${TIMESTAMP}@test.com`;
const PASSWORD = 'Test@123';

async function run() {
    try {
        console.log('--- 1. Registering New Tenant ---');
        console.log(`Subdomain: ${SUBDOMAIN}`);
        console.log(`Email: ${EMAIL}`);

        const registerRes = await fetch(`${API_URL}/auth/register-tenant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tenantName: `Test Company ${TIMESTAMP}`,
                subdomain: SUBDOMAIN,
                adminFullName: 'Test Admin',
                adminEmail: EMAIL,
                adminPassword: PASSWORD
            })
        });

        const registerData = await registerRes.json();
        console.log('Register Status:', registerRes.status);
        console.log('Register Response:', JSON.stringify(registerData, null, 2));

        if (!registerData.success) {
            console.error('Registration failed! Aborting login.');
            return;
        }

        console.log('\n--- 2. Logging In ---');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: EMAIL,
                password: PASSWORD,
                tenantSubdomain: SUBDOMAIN
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Response:', JSON.stringify(loginData, null, 2));

        if (loginRes.status === 200 && loginData.success) {
            console.log('✅ SUCCESS: New tenant registered and logged in.');
        } else {
            console.error('❌ FAILURE: Login failed for new tenant.');
        }

    } catch (error) {
        console.error('Script Error:', error);
    }
}

run();
