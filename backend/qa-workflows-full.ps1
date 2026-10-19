$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000/api'
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$results = @()

function Add-Result($step, $status, $detail) {
  $script:results += [pscustomobject]@{ Step = $step; Status = $status; Detail = $detail }
  Write-Host ("[{0}] {1} - {2}" -f $status, $step, $detail)
}

function Json($value) {
  return $value | ConvertTo-Json -Depth 10
}

function AuthHeader($token) {
  return @{ Authorization = "Bearer $token" }
}

function Login($email, $password) {
  $body = Json @{ email = $email; password = $password }
  $response = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType 'application/json' -Body $body
  if (-not $response.data.accessToken) { throw "Login token missing for $email" }
  return $response.data.accessToken
}

function Ensure-MasterItem($type, $name, $headers) {
  $items = (Invoke-RestMethod -Method GET -Uri "$base/master-data/$type" -Headers $headers).data
  $existing = @($items | Where-Object { $_.name -eq $name } | Select-Object -First 1)
  if ($existing.Count -gt 0) { return $existing[0] }

  $body = Json @{ name = $name; active = $true }
  return (Invoke-RestMethod -Method POST -Uri "$base/master-data/$type" -Headers $headers -ContentType 'application/json' -Body $body).data
}

function Require-Success($response, $label) {
  if (-not $response.success) { throw "$label failed" }
}

$health = Invoke-RestMethod -Method GET -Uri "$base/health"
Add-Result 'health' 'PASS' $health.message

$adminEmail = if ($env:ADMIN_EMAIL) { $env:ADMIN_EMAIL } else { 'frank.admin@hirexo.test' }
$adminPassword = if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } else { 'FrankAdmin123!' }
$adminToken = Login $adminEmail $adminPassword
$adminHeader = AuthHeader $adminToken
Add-Result 'admin-login' 'PASS' $adminEmail

$category = Ensure-MasterItem 'categories' 'Engineering' $adminHeader
$location = Ensure-MasterItem 'locations' 'Colombo' $adminHeader
$jobType = Ensure-MasterItem 'job-types' 'Full Time' $adminHeader
$industry = Ensure-MasterItem 'industries' 'Technology' $adminHeader
Add-Result 'admin-master-data-crud' 'PASS' 'minimal records ready'

$employerEmail = "workflow.employer.$stamp@hirexo.test"
$employerPass = 'WorkflowEmployer123!'
$empReg = Invoke-RestMethod -Method POST -Uri "$base/auth/register/employer" -ContentType 'application/json' -Body (Json @{
  name = 'Workflow Employer'
  companyName = 'Workflow QA Labs'
  email = $employerEmail
  password = $employerPass
  phone = '9000000000'
  location = 'Colombo'
})
Require-Success $empReg 'employer register'
$employerToken = Login $employerEmail $employerPass
$employerHeader = AuthHeader $employerToken
Add-Result 'employer-register-login' 'PASS' $employerEmail

$candidateEmail = "workflow.candidate.$stamp@hirexo.test"
$candidatePass = 'WorkflowCandidate123!'
$candReg = Invoke-RestMethod -Method POST -Uri "$base/auth/register/candidate" -ContentType 'application/json' -Body (Json @{
  name = 'Workflow Candidate'
  email = $candidateEmail
  password = $candidatePass
})
Require-Success $candReg 'candidate register'
$candidateToken = Login $candidateEmail $candidatePass
$candidateHeader = AuthHeader $candidateToken
Add-Result 'candidate-register-login' 'PASS' $candidateEmail

$profile = Invoke-RestMethod -Method PATCH -Uri "$base/candidates/profile" -Headers $candidateHeader -ContentType 'application/json' -Body (Json @{
  headline = 'QA automation candidate'
  summary = 'Testing complete workflow'
  phone = '0770000000'
  location = 'Colombo'
  skills = @('React', 'Node.js', 'MongoDB')
  experienceYears = 3
  preferredLocations = @('Colombo', 'Remote')
})
Require-Success $profile 'candidate profile update'
Add-Result 'candidate-profile-edit' 'PASS' 'profile saved'

$fixtureDir = Join-Path $PSScriptRoot 'uploads'
New-Item -ItemType Directory -Force -Path $fixtureDir | Out-Null
$resumePath = Join-Path $fixtureDir "workflow-resume-$stamp.pdf"
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

$jobCreate = Invoke-RestMethod -Method POST -Uri "$base/jobs" -Headers $employerHeader -ContentType 'application/json' -Body (Json @{
  title = "Workflow QA Engineer $stamp"
  description = 'End to end QA workflow role'
  category = $category.name
  location = $location.name
  jobType = $jobType.name
  industry = $industry.name
  experienceLevel = 'Mid'
  salaryMin = 250000
  salaryMax = 450000
  vacancies = 1
  requirements = @('React', 'Node.js')
  responsibilities = @('Test workflows', 'Fix regressions')
  skills = @('React', 'Node.js', 'MongoDB')
  tags = @('qa', 'workflow')
})
$jobId = $jobCreate.data._id
Add-Result 'employer-job-create' 'PASS' $jobId

$jobUpdate = Invoke-RestMethod -Method PATCH -Uri "$base/jobs/$jobId" -Headers $employerHeader -ContentType 'application/json' -Body (Json @{
  title = "Workflow QA Engineer Updated $stamp"
  description = 'Updated end to end QA workflow role'
  category = $category.name
  location = $location.name
  jobType = $jobType.name
  industry = $industry.name
  experienceLevel = 'Mid'
  salaryMin = 260000
  salaryMax = 460000
  vacancies = 2
  requirements = @('React', 'Node.js')
  responsibilities = @('Test workflows', 'Fix regressions')
  skills = @('React', 'Node.js', 'MongoDB')
  tags = @('qa', 'workflow', 'updated')
})
Require-Success $jobUpdate 'job update'
Add-Result 'employer-job-edit' 'PASS' 'job updated and resubmitted'

$approve = Invoke-RestMethod -Method PATCH -Uri "$base/admin/jobs/$jobId/approve" -Headers $adminHeader
Require-Success $approve 'job approve'
Add-Result 'admin-job-approve' 'PASS' $approve.message

$saveJob = Invoke-RestMethod -Method POST -Uri "$base/candidates/saved-jobs/$jobId" -Headers $candidateHeader
Require-Success $saveJob 'save job'
$unsaveJob = Invoke-RestMethod -Method DELETE -Uri "$base/candidates/saved-jobs/$jobId" -Headers $candidateHeader
Require-Success $unsaveJob 'unsave job'
Add-Result 'candidate-save-unsave-job' 'PASS' 'save and remove worked'

$apply = Invoke-RestMethod -Method POST -Uri "$base/applications" -Headers $candidateHeader -ContentType 'application/json' -Body (Json @{
  jobId = $jobId
  coverLetter = 'Applying from workflow QA script'
})
$applicationId = $apply.data._id
Add-Result 'candidate-apply' 'PASS' $applicationId

$jobApps = Invoke-RestMethod -Method GET -Uri "$base/applications/job/$jobId" -Headers $employerHeader
if (@($jobApps.data).Count -lt 1) { throw 'employer cannot see application' }
$appDetail = Invoke-RestMethod -Method GET -Uri "$base/applications/$applicationId" -Headers $employerHeader
Require-Success $appDetail 'application detail'
Add-Result 'employer-applicant-view' 'PASS' 'application detail loaded'

$downloadPath = Join-Path $fixtureDir "downloaded-resume-$stamp.pdf"
curl.exe -s -f -L -o $downloadPath "$base/applications/$applicationId/resume" -H "Authorization: Bearer $employerToken"
if (-not (Test-Path $downloadPath) -or ((Get-Item $downloadPath).Length -le 0)) { throw 'resume download failed' }
Add-Result 'employer-resume-download' 'PASS' "downloaded $((Get-Item $downloadPath).Length) bytes"

$reviewed = Invoke-RestMethod -Method PATCH -Uri "$base/employers/applications/$applicationId/status" -Headers $employerHeader -ContentType 'application/json' -Body (Json @{
  status = 'reviewed'
  notes = 'Resume reviewed'
})
Require-Success $reviewed 'status reviewed'
$interviewAt = (Get-Date).AddDays(3).ToUniversalTime().ToString('o')
$interview = Invoke-RestMethod -Method PATCH -Uri "$base/employers/applications/$applicationId/status" -Headers $employerHeader -ContentType 'application/json' -Body (Json @{
  status = 'interview_scheduled'
  interviewScheduledAt = $interviewAt
  interviewMode = 'video'
  interviewMeetingLink = 'https://meet.google.com/workflow-qa'
  interviewNotes = 'Workflow interview test'
})
Require-Success $interview 'interview schedule'
Add-Result 'employer-status-interview' 'PASS' 'reviewed then interview_scheduled'

$candidateApps = Invoke-RestMethod -Method GET -Uri "$base/candidates/applications" -Headers $candidateHeader
if (@($candidateApps.data | Where-Object { $_._id -eq $applicationId }).Count -lt 1) { throw 'candidate cannot see scheduled application' }
$candidateInterviews = @($candidateApps.data | Where-Object { $_._id -eq $applicationId -and $_.status -eq 'interview_scheduled' })
if ($candidateInterviews.Count -lt 1) { throw 'candidate interview status missing' }
Add-Result 'candidate-application-interview-view' 'PASS' 'scheduled interview visible'

$message1 = Invoke-RestMethod -Method POST -Uri "$base/applications/$applicationId/messages" -Headers $employerHeader -ContentType 'application/json' -Body (Json @{
  message = 'Please prepare your resume walkthrough.'
  recipientRole = 'candidate'
})
Require-Success $message1 'employer message'
$message2 = Invoke-RestMethod -Method POST -Uri "$base/applications/$applicationId/messages" -Headers $candidateHeader -ContentType 'application/json' -Body (Json @{
  message = 'Thanks, I will be ready.'
  recipientRole = 'employer'
})
Require-Success $message2 'candidate message'
$adminMessage = Invoke-RestMethod -Method POST -Uri "$base/applications/$applicationId/messages" -Headers $adminHeader -ContentType 'application/json' -Body (Json @{
  message = 'Admin note: interview workflow verified.'
  recipientRole = 'employer'
})
Require-Success $adminMessage 'admin message'
$messages = Invoke-RestMethod -Method GET -Uri "$base/applications/$applicationId/messages" -Headers $employerHeader
if (@($messages.data.messages).Count -lt 3) { throw 'messages missing' }
Add-Result 'application-messages' 'PASS' "$(@($messages.data.messages).Count) messages visible"

$offer = Invoke-RestMethod -Method POST -Uri "$base/employers/offers" -Headers $employerHeader -ContentType 'application/json' -Body (Json @{
  applicationId = $applicationId
  title = "Workflow QA Offer $stamp"
  salary = 400000
  currency = 'LKR'
  status = 'sent'
  notes = 'Workflow offer test'
})
Require-Success $offer 'offer create'
$candidateOffers = Invoke-RestMethod -Method GET -Uri "$base/candidates/offers" -Headers $candidateHeader
if (@($candidateOffers.data | Where-Object { $_._id -eq $offer.data._id }).Count -lt 1) { throw 'candidate offer missing' }
Add-Result 'offer-create-candidate-view' 'PASS' $offer.data._id

$dashboardEndpoints = @(
  @{ name = 'admin-dashboard'; method = 'GET'; uri = "$base/admin/dashboard"; headers = $adminHeader },
  @{ name = 'admin-applications'; method = 'GET'; uri = "$base/admin/applications"; headers = $adminHeader },
  @{ name = 'admin-reports'; method = 'GET'; uri = "$base/admin/reports"; headers = $adminHeader },
  @{ name = 'employer-dashboard'; method = 'GET'; uri = "$base/employers/dashboard"; headers = $employerHeader },
  @{ name = 'employer-jobs'; method = 'GET'; uri = "$base/employers/jobs"; headers = $employerHeader },
  @{ name = 'employer-applicants'; method = 'GET'; uri = "$base/employers/jobs/$jobId/applications"; headers = $employerHeader },
  @{ name = 'employer-interview-calendar'; method = 'GET'; uri = "$base/employers/interviews/calendar"; headers = $employerHeader },
  @{ name = 'employer-activity-calendar'; method = 'GET'; uri = "$base/employers/activity-calendar"; headers = $employerHeader },
  @{ name = 'employer-offers'; method = 'GET'; uri = "$base/employers/offers"; headers = $employerHeader },
  @{ name = 'candidate-profile'; method = 'GET'; uri = "$base/candidates/profile"; headers = $candidateHeader },
  @{ name = 'candidate-resume'; method = 'GET'; uri = "$base/candidates/resume"; headers = $candidateHeader },
  @{ name = 'candidate-applications'; method = 'GET'; uri = "$base/candidates/applications"; headers = $candidateHeader }
)

foreach ($endpoint in $dashboardEndpoints) {
  $response = Invoke-RestMethod -Method $endpoint.method -Uri $endpoint.uri -Headers $endpoint.headers
  Require-Success $response $endpoint.name
  Add-Result $endpoint.name 'PASS' 'loaded'
}

$draftJob = Invoke-RestMethod -Method POST -Uri "$base/jobs" -Headers $employerHeader -ContentType 'application/json' -Body (Json @{
  title = "Workflow Delete Draft $stamp"
  description = 'Temporary draft to validate delete'
  category = $category.name
  location = $location.name
  jobType = $jobType.name
  industry = $industry.name
  saveAsDraft = $true
})
$draftJobId = $draftJob.data._id
$deleteDraft = Invoke-RestMethod -Method DELETE -Uri "$base/jobs/$draftJobId" -Headers $employerHeader
Require-Success $deleteDraft 'job delete'
Add-Result 'employer-job-delete' 'PASS' $draftJobId

Write-Host "`n=== WORKFLOW QA SUMMARY ==="
$results | Format-Table -AutoSize
$fails = @($results | Where-Object { $_.Status -eq 'FAIL' })
if ($fails.Count -eq 0) {
  Write-Host "FINAL: PASS (All workflow QA checks passed)"
} else {
  Write-Host ("FINAL: FAIL (" + $fails.Count + " step(s) failed)")
  exit 1
}
