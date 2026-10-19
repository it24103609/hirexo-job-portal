const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const { env, assertEnv } = require('../config/env');
const { uploadRoot } = require('../config/multer');
require('../models/User');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');

const DEMO_PDF = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 14 Tf 40 240 Td (HEXORA Demo Resume) Tj ET
endstream
endobj
trailer
<< /Root 1 0 R >>
%%EOF
`;

function safeFileName(value) {
  return String(value || 'candidate')
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'candidate';
}

async function attachDemoResumes() {
  assertEnv();
  await connectDB(env.mongoUri);

  fs.mkdirSync(uploadRoot, { recursive: true });

  const applications = await Application.find()
    .populate('candidateUser', 'name email')
    .sort({ createdAt: -1 });

  let updatedApplications = 0;
  let updatedProfiles = 0;

  for (const application of applications) {
    const candidate = application.candidateUser;
    if (!candidate?._id) continue;

    const baseName = safeFileName(candidate.name || candidate.email);
    const fileName = `${baseName}-demo-resume.pdf`;
    const filePath = path.join(uploadRoot, fileName);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, DEMO_PDF, 'ascii');
    }

    const stats = fs.statSync(filePath);
    const resume = {
      fileName,
      filePath,
      mimeType: 'application/pdf',
      size: stats.size,
      uploadedAt: new Date()
    };

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: candidate._id },
      {
        $set: { resume },
        $setOnInsert: { user: candidate._id, savedJobs: [] }
      },
      { new: true, upsert: true }
    );

    if (profile) updatedProfiles += 1;

    if (!application.resumeSnapshot?.filePath || !fs.existsSync(application.resumeSnapshot.filePath)) {
      application.resumeSnapshot = {
        fileName: resume.fileName,
        filePath: resume.filePath,
        size: resume.size
      };
      await application.save();
      updatedApplications += 1;
    }
  }

  console.log(`Demo resumes attached. profiles=${updatedProfiles}, applications=${updatedApplications}`);
  process.exit(0);
}

attachDemoResumes().catch((error) => {
  console.error(error);
  process.exit(1);
});
