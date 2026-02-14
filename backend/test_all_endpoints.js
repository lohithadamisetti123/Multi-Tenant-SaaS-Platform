const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';
let superAdminToken = '';
let tenantAdminToken = '';
let userToken = '';
let tenantId = '';
let projectId = '';
let taskId = '';
let createdUserId = '';

// Helper for requests
async function request(endpoint, method, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${endpoint}`, config);
    const data = await res.json();
    return { status: res.status, data };
}

async function runTests() {
    console.log('🚀 Starting Comprehensive Backend Test...\n');

    // --- 1. AUTH & TENANTS ---
    console.log('--- 1. Authentication & Tenant Management ---');

    // 1.1 Register New Tenant
    const tenantName = `TestCorp_${Date.now()}`;
    console.log(`Testing Register Tenant (${tenantName})...`);
    const regTenant = await request('/auth/register-tenant', 'POST', {
        tenantName,
        subdomain: `test${Date.now()}`,
        adminEmail: `admin${Date.now()}@test.com`,
        adminPassword: 'Password@123',
        adminFullName: 'Test Admin'
    });
    if (regTenant.status === 201) {
        console.log('✅ Tenant Registered');
        tenantId = regTenant.data.data.tenant.id;
    } else {
        console.error('❌ Register Tenant Failed', regTenant.data);
        return;
    }

    // 1.2 Login as Tenant Admin
    console.log('Testing Tenant Admin Login...');
    const adminLogin = await request('/auth/login', 'POST', {
        email: regTenant.data.data.admin.email,
        password: 'Password@123',
        tenantSubdomain: regTenant.data.data.tenant.subdomain
    });
    if (adminLogin.status === 200) {
        console.log('✅ Admin Login Success');
        tenantAdminToken = adminLogin.data.data.token;
    } else {
        console.error('❌ Admin Login Failed');
        return;
    }

    // 1.3 Super Admin Login
    console.log('Testing Super Admin Login...');
    const superLogin = await request('/auth/login', 'POST', {
        email: 'superadmin@system.com',
        password: 'Admin@123'
    });
    if (superLogin.status === 200) {
        console.log('✅ Super Admin Login Success');
        superAdminToken = superLogin.data.data.token;
    } else {
        console.error('❌ Super Admin Login Failed');
    }

    // 1.4 Get Tenants (Super Admin)
    console.log('Testing Get Tenants (Super Admin)...');
    const tenantsList = await request('/tenants', 'GET', null, superAdminToken);
    if (tenantsList.status === 200) {
        console.log(`✅ Tenants List Retrieved (${tenantsList.data.data.tenants.length} items)`);
    } else {
        console.error('❌ Get Tenants Failed');
    }

    // --- 2. USER MANAGEMENT ---
    console.log('\n--- 2. User Management ---');

    // 2.1 Create User (as Admin)
    console.log('Testing Create User...');
    const userEmail = `user${Date.now()}@test.com`;
    const createUser = await request('/auth/register', 'POST', {
        fullName: 'Test Employee',
        email: userEmail,
        password: 'Password@123',
        tenantSubdomain: regTenant.data.data.tenant.subdomain
    });

    // Note: Use register endpoint or createUser via admin? 
    // If strict on routes, admin creates users via POST /users or users self-register via POST /auth/register
    // Let's test the public register we verified earlier.
    if (createUser.status === 201) {
        console.log('✅ User Registration Success');
        createdUserId = createUser.data.data.id;
    } else {
        console.error('❌ User Registration Failed', createUser.data);
    }

    // 2.2 Login as User
    console.log('Testing User Login...');
    const userLogin = await request('/auth/login', 'POST', {
        email: userEmail,
        password: 'Password@123',
        tenantSubdomain: regTenant.data.data.tenant.subdomain
    });
    if (userLogin.status === 200) {
        console.log('✅ User Login Success');
        userToken = userLogin.data.data.token;
    } else {
        console.error('❌ User Login Failed');
    }

    // --- 3. PROJECT MANAGEMENT ---
    console.log('\n--- 3. Project Management ---');

    // 3.1 Create Project (Admin)
    console.log('Testing Create Project (Admin)...');
    const createProj = await request('/projects', 'POST', {
        name: 'Alpha Project',
        description: 'Top Secret'
    }, tenantAdminToken);

    if (createProj.status === 201) {
        console.log('✅ Project Created');
        projectId = createProj.data.data.id;
    } else {
        console.error('❌ Create Project Failed', createProj.data);
        return;
    }

    // 3.2 Get Projects (User)
    console.log('Testing Get Projects (User)...');
    const getProjs = await request('/projects', 'GET', null, userToken);
    if (getProjs.status === 200 && getProjs.data.data.length > 0) {
        console.log('✅ Projects List Retrieved');
    } else {
        console.error('❌ Get Projects Failed (User might not see it or empty)');
    }

    // 3.3 Get Single Project
    console.log('Testing Get Single Project...');
    const getProj = await request(`/projects/${projectId}`, 'GET', null, tenantAdminToken);
    if (getProj.status === 200) {
        console.log('✅ Get Project Details Success');
    } else {
        console.error('❌ Get Project Details Failed');
    }

    // 3.4 Update Project
    console.log('Testing Update Project...');
    const updateProj = await request(`/projects/${projectId}`, 'PUT', {
        status: 'completed'
    }, tenantAdminToken);
    if (updateProj.status === 200 && updateProj.data.data.status === 'completed') {
        console.log('✅ Project Updated');
    } else {
        console.error('❌ Update Project Failed');
    }

    // --- 4. TASK MANAGEMENT ---
    console.log('\n--- 4. Task Management ---');

    // 4.1 Create Task
    console.log('Testing Create Task...');
    const createTask = await request(`/tasks`, 'POST', {
        title: 'Fix Bugs',
        description: 'Urgent',
        priority: 'high',
        projectId: projectId,
        assigneeId: createdUserId
    }, tenantAdminToken);

    if (createTask.status === 201) {
        console.log('✅ Task Created');
        taskId = createTask.data.data.id;
    } else {
        console.error('❌ Create Task Failed', createTask.data);
    }

    // 4.2 Get Tasks
    console.log('Testing Get Tasks...');
    const getTasks = await request(`/tasks?projectId=${projectId}`, 'GET', null, userToken);
    if (getTasks.status === 200) {
        console.log(`✅ Tasks Retrieved (${getTasks.data.data.length || 0} items)`);
    } else {
        console.error('❌ Get Tasks Failed');
    }

    // 4.3 Update Task Status
    console.log('Testing Update Task...');
    const updateTask = await request(`/tasks/${taskId}`, 'PUT', {
        status: 'done'
    }, userToken); // User updates their task

    if (updateTask.status === 200) {
        console.log('✅ Task Updated');
    } else {
        console.error('❌ Update Task Failed');
    }

    // --- 5. CLEANUP (Optional) ---
    console.log('\n--- 5. Cleanup ---');
    console.log('Testing Delete Project...');
    const delProj = await request(`/projects/${projectId}`, 'DELETE', null, tenantAdminToken);
    if (delProj.status === 200) {
        console.log('✅ Project Deleted');
    } else {
        console.error('❌ Delete Project Failed');
    }

    console.log('\n✨ All Tests Completed ✨');
}

runTests();
