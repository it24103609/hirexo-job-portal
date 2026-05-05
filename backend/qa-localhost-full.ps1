$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000/api'
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

$results = @()
function Add-Result($step, $status, $detail) {
  $script:results += [pscustomobject]@{ Step = $step; Status = $status; Detail = $detail }
  Write-Host ("[{0}] {1} - {2}" -f $status, $step, $detail)
}

function Ensure-MasterItem($type, $name, $headers) {
  $items = (Invoke-RestMethod -Method GET -Uri "$base/master-data/$type" -Headers $headers).data
  $existing = @($items | Where-Object { $_.name -eq $name } | Select-Object -First 1)
  if ($existing.Count -gt 0) { return $existing[0] }

  $body = @{ name = $name; active = $true } | ConvertTo-Json
  return (Invoke-RestMethod -Method POST -Uri "$base/master-data/$type" -Headers $headers -ContentType 'application/json' -Body $body).data
}

# Health
$health = Invoke-RestMethod -Method GET -Uri "$base/health"
Add-Result 'health' 'PASS' $health.message

# Admin login first (needed for protected master-data + approvals)
$adminEmail = if ($env:ADMIN_EMAIL) { $env:ADMIN_EMAIL } else { 'frank.admin@hirexo.test' }
$adminPassword = if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } else { 'FrankAdmin123!' }
$adminBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json
$admin = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType 'application/json' -Body $adminBody
$adminToken = $admin.data.accessToken
if (-not $adminToken) { throw 'admin token missing' }
Add-Result 'admin-login' 'PASS' 'token issued'

# Master data with admin auth
$authHeader = @{ Authorization = "Bearer $adminToken" }
$category = Ensure-MasterItem 'categories' 'Engineering' $authHeader
$location = Ensure-MasterItem 'locations' 'Colombo' $authHeader
$jobType = Ensure-MasterItem 'job-types' 'Full Time' $authHeader
$industry = Ensure-MasterItem 'industries' 'Technology' $authHeader
Add-Result 'master-data' 'PASS' "category=$($category.name), location=$($location.name), jobType=$($jobType.name), industry=$($industry.name)"

# Employer register/login
$employerEmail = "qa.employer.$stamp@hirexo.test"
$employerPass = 'QaEmployer123!'
$empRegBody = @{ name='QA Employer'; companyName='QA Employer Labs'; email=$employerEmail; password=$employerPass; phone='9000000000'; location='Chennai' } | ConvertTo-Json
$empReg = Invoke-RestMethod -Method POST -Uri "$base/auth/register/employer" -ContentType 'application/json' -Body $empRegBody
Add-Result 'employer-register' 'PASS' $empReg.data.user.email

$empLoginBody = @{ email = $employerEmail; password = $employerPass } | ConvertTo-Json
$empLogin = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType 'application/json' -Body $empLoginBody
$employerToken = $empLogin.data.accessToken
if (-not $employerToken) { throw 'employer token missing' }
Add-Result 'employer-login' 'PASS' 'token issued'

# Employer creates job with ObjectId payload
$jobBody = @{
  title = "QA Local Job $stamp"
  description = 'Local QA job create flow'
  category = $category.name
  location = $location.name
  jobType = $jobType.name
  industry = $industry.name
  experienceLevel = 'Mid'
  salaryMin = 500000
  salaryMax = 900000
  vacancies = 2
  requirements = @('Node.js', 'MongoDB')
  responsibilities = @('Build APIs')
  tags = @('qa', 'local')
} | ConvertTo-Json -Depth 5
$jobCreate = Invoke-RestMethod -Method POST -Uri "$base/jobs" -Headers @{ Authorization = "Bearer $employerToken" } -ContentType 'application/json' -Body $jobBody
$jobId = $jobCreate.data._id
if (-not $jobId) { throw 'job id missing after create' }
Add-Result 'employer-create-job' 'PASS' "jobId=$jobId"

# Admin approve
$approve = Invoke-RestMethod -Method PATCH -Uri "$base/admin/jobs/$jobId/approve" -Headers $authHeader
Add-Result 'admin-approve-job' 'PASS' $approve.message

# Candidate register/login/upload/apply
$candidateEmail = "qa.candidate.$stamp@hirexo.test"
$candidatePass = 'QaCandidate123!'
$candRegBody = @{ name='QA Candidate'; email=$candidateEmail; password=$candidatePass } | ConvertTo-Json
$candReg = Invoke-RestMethod -Method POST -Uri "$base/auth/register/candidate" -ContentType 'application/json' -Body $candRegBody
Add-Result 'candidate-register' 'PASS' $candReg.data.user.email

$candLoginBody = @{ email=$candidateEmail; password=$candidatePass } | ConvertTo-Json
$candLogin = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType 'application/json' -Body $candLoginBody
$candidateToken = $candLogin.data.accessToken
if (-not $candidateToken) { throw 'candidate token missing' }
Add-Result 'candidate-login' 'PASS' 'token issued'

$fixtureDir = Join-Path $PSScriptRoot 'uploads'
New-Item -ItemType Directory -Force -Path $fixtureDir | Out-Null
$resumePath = Join-Path $fixtureDir 'qa-local-resume.pdf'
@"
%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>
endobj
trailer
<< /Root 1 0 R >>
%%EOF
"@ | Set-Content -Path $resumePath -Encoding ascii
$uploadResp = curl.exe -s -X POST "$base/candidates/resume" -H "Authorization: Bearer $candidateToken" -F "resume=@$resumePath;type=application/pdf"
$uploadJson = $uploadResp | ConvertFrom-Json
if (-not $uploadJson.success) { throw "resume upload failed: $uploadResp" }
Add-Result 'candidate-resume-upload' 'PASS' 'resume uploaded'

$applyBody = @{ jobId = $jobId; coverLetter = 'QA local full-flow apply' } | ConvertTo-Json
$apply = Invoke-RestMethod -Method POST -Uri "$base/applications" -Headers @{ Authorization = "Bearer $candidateToken" } -ContentType 'application/json' -Body $applyBody
$appId = $apply.data._id
Add-Result 'candidate-apply' 'PASS' "applicationId=$appId"

$myApps = Invoke-RestMethod -Method GET -Uri "$base/applications/my" -Headers @{ Authorization = "Bearer $candidateToken" }
$count = if ($myApps.data) { $myApps.data.Count } else { 0 }
Add-Result 'candidate-my-applications' 'PASS' "count=$count"

# CORS for local frontend origin
$cors = curl.exe -s -i -X OPTIONS "$base/auth/login" -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type"
if ($cors -match 'Access-Control-Allow-Origin:\s*http://localhost:5173') {
  Add-Result 'cors-localhost' 'PASS' 'preflight allowed for localhost:5173'
} else {
  Add-Result 'cors-localhost' 'FAIL' 'allow-origin header missing for localhost:5173'
}

Write-Host "`n=== LOCALHOST FULL QA SUMMARY ==="
$results | Format-Table -AutoSize
$fails = @($results | Where-Object { $_.Status -eq 'FAIL' })
if ($fails.Count -eq 0) {
  Write-Host "FINAL: PASS (All localhost QA checks passed)"
} else {
  Write-Host ("FINAL: FAIL (" + $fails.Count + " step(s) failed)")
  exit 1
}
