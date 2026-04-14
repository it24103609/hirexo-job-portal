$ErrorActionPreference='Stop'
$base='http://localhost:5000/api'
$stamp=[DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$employerEmail="local.employer.$stamp@hirexo.test"
$employerPass='EmpLocal123!'
$candidateEmail="local.cand2.$stamp@hirexo.test"
$candidatePass='CandLocal123!'

Write-Host "CHAIN 1: Register employer"
$empRegBody=@{name='Local Employer'; companyName='Local Employer Labs'; email=$employerEmail; password=$employerPass; phone='9876543210'; location='Chennai'} | ConvertTo-Json
$empReg=Invoke-RestMethod -Method POST -Uri "$base/auth/register/employer" -ContentType 'application/json' -Body $empRegBody
Write-Host ("  PASS -> employer: " + $empReg.data.user.email)

Write-Host "CHAIN 2: Employer login"
$empLoginBody=@{email=$employerEmail;password=$employerPass} | ConvertTo-Json
$empLogin=Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType 'application/json' -Body $empLoginBody
$empToken=$empLogin.data.accessToken
Write-Host "  PASS -> employer login"

Write-Host "CHAIN 3: Employer post job"
$jobBody=@{
  title="Local QA Job $stamp"
  description='Local chain test job'
  companyName='Local Employer Labs'
  location='Chennai'
  salary='12 LPA'
  jobType='Full-time'
  requirements=@('Node.js')
  responsibilities=@('Build APIs')
  tags=@('local','qa')
} | ConvertTo-Json
$jobCreate=Invoke-RestMethod -Method POST -Uri "$base/jobs" -Headers @{Authorization="Bearer $empToken"} -ContentType 'application/json' -Body $jobBody
$jobId=$jobCreate.data._id
Write-Host ("  PASS -> job created (pending): " + $jobId)

Write-Host "CHAIN 4: Admin login + approve job"
$adminBody=@{email='admin@hirexo.com';password='admin123'} | ConvertTo-Json
$admin=Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType 'application/json' -Body $adminBody
$adminToken=$admin.data.accessToken
$approve=Invoke-RestMethod -Method PATCH -Uri "$base/admin/jobs/$jobId/approve" -Headers @{Authorization="Bearer $adminToken"}
Write-Host "  PASS -> job approved by admin"

Write-Host "CHAIN 5: Register candidate + login"
$candRegBody=@{name='Local Chain Candidate';email=$candidateEmail;password=$candidatePass} | ConvertTo-Json
$candReg=Invoke-RestMethod -Method POST -Uri "$base/auth/register/candidate" -ContentType 'application/json' -Body $candRegBody
$candLoginBody=@{email=$candidateEmail;password=$candidatePass} | ConvertTo-Json
$candLogin=Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType 'application/json' -Body $candLoginBody
$candToken=$candLogin.data.accessToken
Write-Host "  PASS -> candidate ready"

Write-Host "CHAIN 6: Candidate upload resume"
$resumePath="c:\Users\thanu\Desktop\my-website (2)\backend\uploads\local-chain-resume.pdf"
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
$up = curl.exe -s -X POST "$base/candidates/resume" -H "Authorization: Bearer $candToken" -F "resume=@$resumePath;type=application/pdf"
$upj = $up | ConvertFrom-Json
if (-not $upj.success) { throw "resume upload failed" }
Write-Host "  PASS -> candidate resume uploaded"

Write-Host "CHAIN 7: Candidate apply to approved job"
$applyBody=@{jobId=$jobId; coverLetter='Chain test application'} | ConvertTo-Json
$apply=Invoke-RestMethod -Method POST -Uri "$base/applications" -Headers @{Authorization="Bearer $candToken"} -ContentType 'application/json' -Body $applyBody
Write-Host ("  PASS -> applied id: " + $apply.data._id)

Write-Host "CHAIN DONE: End-to-end employer->admin->candidate apply PASSED"
Write-Host ("EMPLOYER_EMAIL=" + $employerEmail)
Write-Host ("CANDIDATE_EMAIL=" + $candidateEmail)
