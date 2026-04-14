$ErrorActionPreference = 'Stop'
$base='http://localhost:5000/api'
$stamp=[DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$candidateEmail="local.candidate.$stamp@hirexo.test"
$candidatePassword='LocalPass123!'

Write-Host "STEP 0: Health check"
$health=Invoke-RestMethod -Method GET -Uri "$base/health"
Write-Host ("  PASS -> " + $health.message)

Write-Host "STEP 1: Admin login"
$adminBody=@{email='admin@hirexo.com';password='admin123'} | ConvertTo-Json
$admin=Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType 'application/json' -Body $adminBody
$adminToken=$admin.data.accessToken
Write-Host "  PASS -> admin login success"

Write-Host "STEP 2: Candidate register"
$candidateRegBody=@{name='Local Smoke Candidate';email=$candidateEmail;password=$candidatePassword} | ConvertTo-Json
$candidateReg=Invoke-RestMethod -Method POST -Uri "$base/auth/register/candidate" -ContentType 'application/json' -Body $candidateRegBody
Write-Host ("  PASS -> candidate registered: " + $candidateReg.data.user.email)

Write-Host "STEP 3: Candidate login"
$candidateLoginBody=@{email=$candidateEmail;password=$candidatePassword} | ConvertTo-Json
$candidateLogin=Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType 'application/json' -Body $candidateLoginBody
$candidateToken=$candidateLogin.data.accessToken
Write-Host "  PASS -> candidate login success"

Write-Host "STEP 4: Create test resume PDF"
$resumePath="c:\Users\thanu\Desktop\my-website (2)\backend\uploads\local-test-resume.pdf"
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
Write-Host "  PASS -> resume file ready"

Write-Host "STEP 5: Upload resume"
$uploadResp = curl.exe -s -X POST "$base/candidates/resume" -H "Authorization: Bearer $candidateToken" -F "resume=@$resumePath;type=application/pdf"
if (-not $uploadResp) { throw 'resume upload empty response' }
$uploadJson = $uploadResp | ConvertFrom-Json
if (-not $uploadJson.success) { throw "resume upload failed: $uploadResp" }
Write-Host "  PASS -> resume uploaded"

Write-Host "STEP 6: Fetch featured jobs"
$jobs=Invoke-RestMethod -Method GET -Uri "$base/jobs/featured"
if (-not $jobs.data -or $jobs.data.Count -eq 0) { throw 'no featured jobs to apply' }
$jobId = $jobs.data[0]._id
Write-Host ("  PASS -> selected job id: " + $jobId)

Write-Host "STEP 7: Apply for job"
$applyBody=@{jobId=$jobId;coverLetter='Local smoke apply from candidate flow'} | ConvertTo-Json
$apply=Invoke-RestMethod -Method POST -Uri "$base/applications" -ContentType 'application/json' -Headers @{Authorization="Bearer $candidateToken"} -Body $applyBody
if (-not $apply.success) { throw 'apply failed' }
Write-Host ("  PASS -> application submitted: " + $apply.data._id)

Write-Host "STEP 8: Verify my applications"
$myApps=Invoke-RestMethod -Method GET -Uri "$base/applications/my" -Headers @{Authorization="Bearer $candidateToken"}
$count = if ($myApps.data) { $myApps.data.Count } else { 0 }
Write-Host ("  PASS -> applications visible: " + $count)

Write-Host "DONE: Local login-to-apply flow PASSED"
Write-Host ("CANDIDATE_EMAIL=" + $candidateEmail)
