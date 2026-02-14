const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'admin@demo.com';
const PASSWORD = 'Demo@123';
const SUBDOMAIN = 'demo';
const BAD_PROJECT_ID = '822018c7-2bc6-452c-9812-fb990d44b4c2';

async function run() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD, tenantSubdomain: SUBDOMAIN })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }

        const { token, tenantId } = loginData.data;
        console.log('Login success. TenantID:', tenantId);
        console.log('Token:', token.substring(0, 20) + '...');

        // 2. Get Tenant Stats
        console.log(`\n2. Fetching Tenant Stats for ${tenantId}...`);
        const tenantRes = await fetch(`${API_URL}/tenants/${tenantId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tenantData = await tenantRes.json();
        console.log('Tenant Stats Response:', JSON.stringify(tenantData.data.stats, null, 2));

        // 3. Get Project List
        console.log('\n3. Fetching Project List...');
        const projectsRes = await fetch(`${API_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
        console.log(`Found ${projectsData.data.length} projects.`);
        if (projectsData.data.length > 0) {
            console.log('First project ID:', projectsData.data[0].id);
        }

        // 4. Get Specific Project (Trigger 500?)
        const projectId = BAD_PROJECT_ID;
        console.log(`\n4. Fetching Project ${projectId}...`);
        const projectRes = await fetch(`${API_URL}/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectData = await projectRes.json();
        console.log('Project Response Status:', projectRes.status);
        console.log('Project Response Body:', projectData);

    } catch (error) {
        console.error('Error in script:', error);
    }
}

run();
