const fs = require('fs');
const path = require('path');
let pdf = null;
try {
  pdf = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse module optional load warning:', e.message);
}

const COMMON_SKILLS_DICTIONARY = [
  'javascript', 'typescript', 'react', 'react native', 'next.js', 'vue', 'angular',
  'node.js', 'express', 'python', 'django', 'flask', 'java', 'spring', 'c++', 'c#', '.net',
  'html', 'html5', 'css', 'css3', 'tailwind', 'bootstrap', 'sass', 'less',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'sqlite', 'oracle',
  'aws', 'azure', 'docker', 'kubernetes', 'git', 'github', 'gitlab', 'ci/cd', 'jenkins',
  'rest api', 'graphql', 'redux', 'zustand', 'jest', 'cypress', 'selenium',
  'figma', 'ui/ux', 'agile', 'scrum', 'jira', 'linux', 'unix', 'bash'
];

function resolveStoredFilePath(filePath) {
  if (!filePath) return null;
  const candidates = [
    path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath),
    path.resolve(__dirname, '../../..', filePath),
    path.resolve(__dirname, '../../', filePath)
  ];
  return candidates.find((cand) => fs.existsSync(cand)) || null;
}

async function extractTextFromResume(filePathOrBuffer, mimeType = '') {
  try {
    let buffer = null;

    if (Buffer.isBuffer(filePathOrBuffer)) {
      buffer = filePathOrBuffer;
    } else if (typeof filePathOrBuffer === 'string') {
      const resolvedPath = resolveStoredFilePath(filePathOrBuffer);
      if (resolvedPath) {
        buffer = fs.readFileSync(resolvedPath);
      }
    }

    if (!buffer || !buffer.length) return null;

    const isPdfMagic = buffer.toString('ascii', 0, 4) === '%PDF';
    const isPdfFile = typeof filePathOrBuffer === 'string' && filePathOrBuffer.toLowerCase().endsWith('.pdf');
    const isPdfMime = String(mimeType).toLowerCase().includes('pdf');

    if ((isPdfMagic || isPdfFile || isPdfMime) && pdf) {
      try {
        if (pdf.PDFParse && typeof pdf.PDFParse === 'function') {
          const parser = new pdf.PDFParse(new Uint8Array(buffer));
          const parsed = await parser.getText();
          if (parsed?.text && parsed.text.trim().length > 0) {
            return parsed.text.trim();
          }
        } else if (typeof pdf === 'function') {
          const parsed = await pdf(buffer);
          if (parsed?.text && parsed.text.trim().length > 0) {
            return parsed.text.trim();
          }
        }
      } catch (pdfErr) {
        console.warn('PDFParse primary attempt failed, falling back:', pdfErr.message);
      }
    }

    const utf8Text = buffer.toString('utf8');
    if (utf8Text && utf8Text.trim().length > 10) {
      return utf8Text.trim();
    }
  } catch (err) {
    console.error('Error extracting text from resume:', err.message);
  }

  return null;
}

async function analyzeResumeAts(filePathOrBuffer, candidateProfile = {}, job = {}) {
  const candidate = candidateProfile.user && typeof candidateProfile.user === 'object' ? candidateProfile.user : {};
  const extractedText = await extractTextFromResume(filePathOrBuffer, candidateProfile.resume?.mimeType);
  const isPdfParsed = Boolean(extractedText && extractedText.length > 20);

  const textToScan = [
    extractedText || '',
    candidateProfile.headline || '',
    candidateProfile.summary || '',
    (candidateProfile.skills || []).join(' '),
    (candidateProfile.education || []).map((e) => `${e.degree || ''} ${e.institution || ''}`).join(' ')
  ].join('\n');

  const words = textToScan.toLowerCase().match(/\b[a-z0-9+#.-]+\b/g) || [];
  const wordCount = extractedText ? extractedText.split(/\s+/).filter(Boolean).length : words.length;

  const emailMatch = textToScan.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = textToScan.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  const linkedinMatch = textToScan.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = textToScan.match(/github\.com\/[a-zA-Z0-9_-]+/i);

  const contactDetails = {
    email: emailMatch ? emailMatch[0] : candidate.email || candidateProfile.email || '',
    phone: phoneMatch ? phoneMatch[0] : candidateProfile.phone || '',
    linkedin: linkedinMatch ? linkedinMatch[0] : candidateProfile.socialLinks?.linkedin || '',
    github: githubMatch ? githubMatch[0] : candidateProfile.socialLinks?.github || '',
    location: candidateProfile.location || ''
  };

  const sectionsFound = {
    summary: /summary|profile|about|overview|objective/i.test(textToScan),
    experience: /experience|employment|work history|career|responsibilities|projects/i.test(textToScan),
    education: /education|university|bachelor|master|bsc|msc|degree|college|diploma/i.test(textToScan),
    skills: /skills|technologies|technical stack|tools|competencies/i.test(textToScan)
  };

  const foundSkillsSet = new Set();
  (candidateProfile.skills || []).forEach((s) => foundSkillsSet.add(String(s).trim()));

  const lowerText = textToScan.toLowerCase();
  COMMON_SKILLS_DICTIONARY.forEach((skill) => {
    if (lowerText.includes(skill)) {
      foundSkillsSet.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  const extractedSkills = Array.from(foundSkillsSet);

  let fileQualityScore = 0;
  if (isPdfParsed) {
    if (wordCount >= 250) fileQualityScore = 25;
    else if (wordCount >= 120) fileQualityScore = 20;
    else if (wordCount >= 40) fileQualityScore = 15;
    else fileQualityScore = 10;
  } else if (candidateProfile.summary || (candidateProfile.skills && candidateProfile.skills.length > 0)) {
    fileQualityScore = 15;
  } else {
    fileQualityScore = 8;
  }

  const sectionCount = Object.values(sectionsFound).filter(Boolean).length;
  const sectionStructureScore = Math.round((sectionCount / 4) * 25);

  let contactInfoScore = 0;
  if (contactDetails.email) contactInfoScore += 5;
  if (contactDetails.phone) contactInfoScore += 5;
  if (contactDetails.location || textToScan.includes('colombo') || textToScan.includes('lanka')) contactInfoScore += 5;
  if (contactDetails.linkedin || contactDetails.github) contactInfoScore += 5;

  const jobSkills = [
    ...(job.tags || []),
    ...(job.skills || []),
    ...(job.category ? [job.category] : []),
    ...(job.title ? job.title.split(' ') : [])
  ]
    .map((s) => String(s).toLowerCase().trim())
    .filter((s) => s.length > 2 && !['and', 'the', 'for', 'with', 'senior', 'junior', 'lead', 'developer'].includes(s));

  const uniqueJobSkills = [...new Set(jobSkills)];
  let matchedJobSkills = [];
  let missingJobSkills = [];
  let keywordMatchScore = 0;

  if (uniqueJobSkills.length > 0) {
    matchedJobSkills = uniqueJobSkills.filter((js) => lowerText.includes(js));
    missingJobSkills = uniqueJobSkills.filter((js) => !lowerText.includes(js));
    const matchRatio = matchedJobSkills.length / uniqueJobSkills.length;
    keywordMatchScore = Math.round(matchRatio * 30);
  } else {
    if (extractedSkills.length >= 8) keywordMatchScore = 30;
    else if (extractedSkills.length >= 5) keywordMatchScore = 22;
    else if (extractedSkills.length >= 3) keywordMatchScore = 15;
    else keywordMatchScore = 8;
  }

  const totalAtsScore = Math.min(100, Math.max(0, fileQualityScore + sectionStructureScore + contactInfoScore + keywordMatchScore));

  return {
    atsScore: totalAtsScore,
    isPdfParsed,
    wordCount,
    extractedTextLength: extractedText ? extractedText.length : 0,
    breakdown: {
      fileQuality: fileQualityScore,
      sectionStructure: sectionStructureScore,
      contactInfo: contactInfoScore,
      keywordMatch: keywordMatchScore
    },
    sectionsFound,
    contactDetails,
    extractedSkills,
    matchedJobSkills,
    missingJobSkills
  };
}

module.exports = {
  resolveStoredFilePath,
  extractTextFromResume,
  analyzeResumeAts
};
