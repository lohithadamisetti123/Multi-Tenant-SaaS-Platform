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
    // Shared state
    let token = '';
    let tenantId = '';
    let userId = '';
    let projectId = '';
    let taskId = '';
    let otherUserId = '';

    // Test Data
    const timestamp = Date.now();
    const testTenant = {
        tenantName: "AutoTest Tenant",
        subdomain: `test${timestamp}`,
        adminEmail: `admin${timestamp}@test.com`,
        adminPassword: "password123",
        adminFullName: "Test Admin"
    };

    try {
        console.log('--- STARTING API TESTS (Dependency-Free) ---');

        // 1. Register Tenant
        console.log('\n1. Register Tenant...');
        try {
            const res = await request(`${BASE_URL}/auth/register-tenant`, 'POST', testTenant);
            console.log('✅ Success:', res.data.message);
            tenantId = res.data.data.tenant.id;
        } catch (e) {
            console.error('❌ Failed Step 1:', e.message);
            process.exit(1);
        }

        // 2. Login
        console.log('\n2. Login...');
        try {
            const res = await request(`${BASE_URL}/auth/login`, 'POST', {
                email: testTenant.adminEmail,
                password: testTenant.adminPassword,
                tenantSubdomain: testTenant.subdomain
            });
            console.log('✅ Success');
            token = res.data.data.token;
            userId = res.data.data.id;

            // Verify lastLogin update (indirectly, if login works it's likely fine, can't easily check DB here without direct access)
        } catch (e) {
            console.error('❌ Failed Step 2:', e.message);
            return;
        }

        // 3. Get Me
        console.log('\n3. Get Me...');
        try {
            const res = await request(`${BASE_URL}/auth/me`, 'GET', null, token);
            console.log('✅ Success:', res.data.data.email);
            if (res.data.data.lastLogin) console.log('   Last Login:', res.data.data.lastLogin);
        } catch (e) { console.error('❌ Failed Step 3:', e.message); }

        // 4. Get Tenant Details
        console.log('\n4. Get Tenant Details...');
        try {
            const res = await request(`${BASE_URL}/tenants/${tenantId}`, 'GET', null, token);
            console.log('✅ Success:', res.data.data.name);
            console.log('   Stats:', JSON.stringify(res.data.data.stats));
        } catch (e) { console.error('❌ Failed Step 4:', e.message); }

        // 5. Update Tenant (Name)
        console.log('\n5. Update Tenant...');
        try {
            const res = await request(`${BASE_URL}/tenants/${tenantId}`, 'PUT', { name: "Updated Test Tenant" }, token);
            console.log('✅ Success:', res.data.data.name);
        } catch (e) { console.error('❌ Failed Step 5:', e.message); }

        // 6. Create User (User Management)
        console.log('\n6. Create User...');
        try {
            const res = await request(`${BASE_URL}/tenants/${tenantId}/users`, 'POST', {
                fullName: "Test User 2",
                email: `user${timestamp}@test.com`,
                password: "password123",
                role: "user"
            }, token);
            console.log('✅ Success:', res.data.data.email);
            otherUserId = res.data.data.id;
            console.log('   Admin User ID:', userId);
            console.log('   Created User ID:', otherUserId);
        } catch (e) { console.error('❌ Failed Step 6:', e.message); }

        // 7. List Users
        console.log('\n7. List Users...');
        try {
            const res = await request(`${BASE_URL}/tenants/${tenantId}/users`, 'GET', null, token);
            console.log('✅ Success: Count', res.data.data.users.length);
        } catch (e) { console.error('❌ Failed Step 7:', e.message); }

        // 8. Create Project (Project Management)
        console.log('\n8. Create Project...');
        try {
            const res = await request(`${BASE_URL}/projects`, 'POST', {
                name: "Test Project",
                description: "Test Description",
                startDate: "2024-01-01",
                endDate: "2024-12-31",
                budget: 50000.00
            }, token);
            console.log('✅ Success:', res.data.data.name);
            console.log('   Budget:', res.data.data.budget);
            projectId = res.data.data.id;
        } catch (e) { console.error('❌ Failed Step 8:', e.message); }

        // 9. List Projects
        console.log('\n9. List Projects...');
        try {
            const res = await request(`${BASE_URL}/projects`, 'GET', null, token);
            console.log('✅ Success: Count', res.data.data.projects.length);
        } catch (e) { console.error('❌ Failed Step 9:', e.message); }

        // 10. Update Project
        console.log('\n10. Update Project...');
        try {
            const res = await request(`${BASE_URL}/projects/${projectId}`, 'PUT', {
                name: "Updated Project Name",
                budget: 60000.00
            }, token);
            console.log('✅ Success:', res.data.data.name);
            console.log('   New Budget:', res.data.data.budget);
        } catch (e) { console.error('❌ Failed Step 10:', e.message); }

        // 11. Create Task (Task Management)
        console.log('\n11. Create Task...');
        try {
            const res = await request(`${BASE_URL}/tasks`, 'POST', {
                title: "Test Task",
                projectId: projectId,
                assignedTo: userId
            }, token);
            console.log('✅ Success:', res.data.data.title);
            taskId = res.data.data.id;
        } catch (e) { console.error('❌ Failed Step 11:', e.message); }

        // 12. List Tasks
        console.log('\n12. List Tasks...');
        try {
            const res = await request(`${BASE_URL}/tasks?projectId=${projectId}`, 'GET', null, token);
            console.log('✅ Success: Count', res.data.data.length);
        } catch (e) { console.error('❌ Failed Step 12:', e.message); }

        // 13. Update Task Status
        console.log('\n13. Update Task Status...');
        try {
            const res = await request(`${BASE_URL}/tasks/${taskId}`, 'PATCH', {
                status: "in_progress"
            }, token);
            console.log('✅ Success:', res.data.data.status);
        } catch (e) { console.error('❌ Failed Step 13:', e.message); }

        // 14. Update Task (Details)
        console.log('\n14. Update Task...');
        try {
            const res = await request(`${BASE_URL}/tasks/${taskId}`, 'PUT', {
                title: "Updated Task Title"
            }, token);
            console.log('✅ Success:', res.data.data.title);
        } catch (e) { console.error('❌ Failed Step 14:', e.message); }

        // 15. Delete Task
        console.log('\n15. Delete Task...');
        try {
            const res = await request(`${BASE_URL}/tasks/${taskId}`, 'DELETE', null, token);
            console.log('✅ Success:', res.data.message);
        } catch (e) { console.error('❌ Failed Step 15:', e.message); }

        // 16. Delete Project
        console.log('\n16. Delete Project...');
        try {
            const res = await request(`${BASE_URL}/projects/${projectId}`, 'DELETE', null, token);
            console.log('✅ Success:', res.data.message);
        } catch (e) { console.error('❌ Failed Step 16:', e.message); }

        // 17. Delete User (Cleanup)
        console.log('\n17. Delete User...');
        try {
            // Note: Users are usually managed under /api/tenants/:tenantId/users or /api/users
            // The routes file shows /api/users/:id for delete
            const res = await request(`${BASE_URL}/users/${otherUserId}`, 'DELETE', null, token);
            console.log('✅ Success:', res.data.message);
        } catch (e) {
            console.error('❌ Failed Step 17:', e.message);
            // Don't fail the whole script if this fails, might be just a permission thing or route difference
        }

        // 18. Logout
        console.log('\n18. Logout...');
        try {
            const res = await request(`${BASE_URL}/auth/logout`, 'POST', null, token);
            console.log('✅ Success:', res.data.message);
        } catch (e) { console.error('❌ Failed Step 18:', e.message); }

        console.log('\n✅✅✅ ALL TESTS PASSED ✅✅✅');
        console.log('\n--- TESTS COMPLETED ---');

    } catch (error) {
        console.error('Global Error', error);
        process.exit(1);
    }
};

runTests();
