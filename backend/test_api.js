const BASE_URL = 'http://localhost:5000/api';

// Helper function for fetch wrapper
const request = async (url, method, body = null, authToken = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const config = {
        method,
        headers,
    };
    if (body) config.body = JSON.stringify(body);

    console.log(`📡 Request: ${method} ${url}`);
    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || `HTTP error! status: ${response.status}`;
            const errorDetail = data.error ? ` Details: ${data.error}` : '';
            throw new Error(errorMessage + errorDetail);
        }
        return { data, status: response.status };
    } catch (error) {
        console.error(`💥 Fetch Error: ${error.message}`);
        throw error;
    }
};

const runTests = async () => {
    let token = '';

    try {
        console.log('--- REPRODUCING BUG WITH DEMO ADMIN ---');

        // 1. Login as Demo Admin
        console.log('\n1. Login as admin@demo.com...');
        try {
            const res = await request(`${BASE_URL}/auth/login`, 'POST', {
                email: 'admin@demo.com',
                password: 'Demo@123',
                tenantSubdomain: 'demo'
            });
            console.log('✅ Login Success');
            token = res.data.data.token;
            console.log('   Tenant ID:', res.data.data.tenant.id);
        } catch (e) {
            console.error('❌ Login Failed:', e.message);
            process.exit(1);
        }

        // 2. Create Project
        console.log('\n2. Create Project...');
        try {
            const res = await request(`${BASE_URL}/projects`, 'POST', {
                name: "Bug Repro Project",
                description: "Testing if this fails"
            }, token);
            console.log('✅ Project Created:', res.data.data.name);
        } catch (e) {
            console.error('❌ Project Creation Failed:', e.message);
        }

    } catch (error) {
        console.error('Global Error', error);
    }
};

runTests();
