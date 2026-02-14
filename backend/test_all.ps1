$baseUrl = "http://localhost:5000/api"

function Request($endpoint, $method, $body = $null, $token = $null) {
    $headers = @{ "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    
    $params = @{
        Uri = "$baseUrl$endpoint"
        Method = $method
        Headers = $headers
        ErrorAction = "Stop"
    }
    if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 10) }
    
    try {
        $res = Invoke-RestMethod @params
        return @{ success = $true; data = $res }
    } catch {
        Write-Host "❌ Request Failed: $_" -ForegroundColor Red
        return @{ success = $false; error = $_ }
    }
}

Write-Host "🚀 Starting Comprehensive Backend Test..." -ForegroundColor Cyan

# --- 1. AUTH & TENANTS ---
Write-Host "`n--- 1. Authentication & Tenant Management ---" -ForegroundColor Yellow

# 1.1 Register Tenant
$tenantName = "TestCorp_$(Get-Date -Format 'yyyyMMddHHmmss')"
Write-Host "Testing Register Tenant ($tenantName)..."
$regBody = @{
    tenantName = $tenantName
    subdomain = "test$(Get-Date -Format 'HHmmss')"
    adminEmail = "admin$(Get-Date -Format 'HHmmss')@test.com"
    adminPassword = "Password@123"
    adminFullName = "Test Admin"
}
$regTenant = Request "/auth/register-tenant" "Post" $regBody

if ($regTenant.success) {
    Write-Host "✅ Tenant Registered" -ForegroundColor Green
    $tenantData = $regTenant.data
    $tenantId = $tenantData.data.tenant.id
} else {
    exit
}

# 1.2 Tenant Admin Login
Write-Host "Testing Tenant Admin Login..."
$loginBody = @{
    email = $regBody.adminEmail
    password = $regBody.adminPassword
    tenantSubdomain = $regBody.subdomain
}
$adminLogin = Request "/auth/login" "Post" $loginBody

if ($adminLogin.success) {
    Write-Host "✅ Admin Login Success" -ForegroundColor Green
    $tenantAdminToken = $adminLogin.data.data.token
} else {
    exit
}

# 1.3 Super Admin Login
Write-Host "Testing Super Admin Login..."
$superLoginBody = @{
    email = "superadmin@system.com"
    password = "Admin@123"
}
$superLogin = Request "/auth/login" "Post" $superLoginBody

if ($superLogin.success) {
    Write-Host "✅ Super Admin Login Success" -ForegroundColor Green
    $superAdminToken = $superLogin.data.data.token
}

# 1.4 Get Tenants (Super Admin)
Write-Host "Testing Get Tenants (Super Admin)..."
$tenantsList = Request "/tenants" "Get" $null $superAdminToken
if ($tenantsList.success) {
    Write-Host "✅ Tenants List Retrieved ($($tenantsList.data.data.tenants.Count) items)" -ForegroundColor Green
}

# --- 2. USER MANAGEMENT ---
Write-Host "`n--- 2. User Management ---" -ForegroundColor Yellow

# 2.1 User Registration
Write-Host "Testing User Registration..."
$userEmail = "user$(Get-Date -Format 'HHmmss')@test.com"
$regUserBody = @{
    fullName = "Test Employee"
    email = $userEmail
    password = "Password@123"
    tenantSubdomain = $regBody.subdomain
}
$createUser = Request "/auth/register" "Post" $regUserBody

if ($createUser.success) {
    Write-Host "✅ User Registration Success" -ForegroundColor Green
    $createdUserId = $createUser.data.data.id
}

# 2.2 User Login
Write-Host "Testing User Login..."
$userLoginBody = @{
    email = $userEmail
    password = "Password@123"
    tenantSubdomain = $regBody.subdomain
}
$userLogin = Request "/auth/login" "Post" $userLoginBody

if ($userLogin.success) {
    Write-Host "✅ User Login Success" -ForegroundColor Green
    $userToken = $userLogin.data.data.token
}

# --- 3. PROJECT MANAGEMENT ---
Write-Host "`n--- 3. Project Management ---" -ForegroundColor Yellow

# 3.1 Create Project (Admin)
Write-Host "Testing Create Project (Admin)..."
$projBody = @{
    name = "Alpha Project"
    description = "Top Secret"
}
$createProj = Request "/projects" "Post" $projBody $tenantAdminToken

if ($createProj.success) {
    Write-Host "✅ Project Created" -ForegroundColor Green
    $projectId = $createProj.data.data.id
} else {
    exit
}

# 3.2 Get Projects (User)
Write-Host "Testing Get Projects (User)..."
$getProjs = Request "/projects" "Get" $null $userToken
if ($getProjs.success) {# -and $getProjs.data.data.Count -gt 0
    Write-Host "✅ Projects List Retrieved" -ForegroundColor Green
}

# 3.3 Update Project
Write-Host "Testing Update Project..."
$updateProjBody = @{ status = "completed" }
$updateProj = Request "/projects/$projectId" "Put" $updateProjBody $tenantAdminToken
if ($updateProj.success -and $updateProj.data.data.status -eq "completed") {
    Write-Host "✅ Project Updated" -ForegroundColor Green
}

# --- 4. TASK MANAGEMENT ---
Write-Host "`n--- 4. Task Management ---" -ForegroundColor Yellow

# 4.1 Create Task
Write-Host "Testing Create Task..."
$taskBody = @{
    title = "Fix Bugs"
    description = "Urgent"
    priority = "high"
    projectId = $projectId
    assigneeId = $createdUserId
}
$createTask = Request "/tasks" "Post" $taskBody $tenantAdminToken

if ($createTask.success) {
    Write-Host "✅ Task Created" -ForegroundColor Green
    $taskId = $createTask.data.data.id
}

# 4.2 Get Tasks
Write-Host "Testing Get Tasks..."
$getTasks = Request "/tasks?projectId=$projectId" "Get" $null $userToken
if ($getTasks.success) {
    Write-Host "✅ Tasks Retrieved ($($getTasks.data.data.Count) items)" -ForegroundColor Green
}

# 4.3 Update Task
Write-Host "Testing Update Task..."
$updateTaskBody = @{ status = "done" }
$updateTask = Request "/tasks/$taskId" "Put" $updateTaskBody $userToken
if ($updateTask.success) {
    Write-Host "✅ Task Updated" -ForegroundColor Green
}

# --- 5. CLEANUP ---
Write-Host "`n--- 5. Cleanup ---" -ForegroundColor Yellow
Write-Host "Testing Delete Project..."
$delProj = Request "/projects/$projectId" "Delete" $null $tenantAdminToken
if ($delProj.success) {
    Write-Host "✅ Project Deleted" -ForegroundColor Green
}

Write-Host "`n✨ All Tests Completed ✨" -ForegroundColor Cyan
