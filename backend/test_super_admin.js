const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testSuperAdmin() {
    try {
        console.log('--- 1. Login as Super Admin ---');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@system.com',
                password: 'Admin@123'
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);

        if (!loginData.success) {
            console.error('Login Failed:', loginData);
            return;
        }

        const token = loginData.data.token;
        console.log('Token received');

        console.log('\n--- 2. Fetch Tenants (Dashboard Data) ---');
        const tenantRes = await fetch(`${API_URL}/tenants?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const tenantData = await tenantRes.json();
        console.log('Tenant List Status:', tenantRes.status);

        if (tenantData.success) {
            console.log('Pagination:', tenantData.data.pagination);
            console.log('Tenants Found:', tenantData.data.tenants.length);
            console.log('✅ Super Admin Dashboard API is working.');
        } else {
            console.error('❌ Failed to fetch tenants:', tenantData);
        }

    } catch (error) {
        console.error('Script Error:', error);
    }
}

testSuperAdmin();
