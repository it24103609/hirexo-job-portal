/**
 * AI Resume Scoring & Optimization Service
 * Provides AI-powered resume analysis for premium candidates
 */

class AiResumeScorer {
  /**
   * Analyze resume content and return score
   * @param {Object} resumeData - Parsed resume data
   * @returns {Object} Scoring result with detailed feedback
   */
  analyzeResume(resumeData) {
    let score = 0;
    const feedback = [];
    const issues = [];

    // Section 1: Basic Information (10 points)
    if (resumeData.personalInfo?.name) score += 3;
    else issues.push('Add your full name');

    if (resumeData.personalInfo?.email) score += 2;
    else issues.push('Add an email address');

    if (resumeData.personalInfo?.phone) score += 2;
    else issues.push('Add a phone number');

    if (resumeData.personalInfo?.location) score += 3;
    else issues.push('Add your location');

    // Section 2: Professional Summary (10 points)
    if (resumeData.summary && resumeData.summary.length > 50) {
      score += 10;
      feedback.push('Strong professional summary');
    } else if (resumeData.summary && resumeData.summary.length > 20) {
      score += 5;
      issues.push('Expand your professional summary (50+ characters recommended)');
    } else {
      issues.push('Add a compelling professional summary');
    }

    // Section 3: Work Experience (25 points)
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      const avgBulletPoints =
        resumeData.workExperience.reduce(
          (sum, exp) => sum + (exp.responsibilities?.length || 0),
          0
        ) / resumeData.workExperience.length;

      score += Math.min(25, resumeData.workExperience.length * 5);

      if (avgBulletPoints >= 3) {
        feedback.push('Detailed work experience with good descriptions');
      } else {
        issues.push('Add more details (3+ bullet points per role recommended)');
      }
    } else {
      issues.push('Add your work experience');
    }

    // Section 4: Education (15 points)
    if (resumeData.education && resumeData.education.length > 0) {
      score += 15;
      feedback.push('Education section complete');
    } else {
      issues.push('Add your educational background');
    }

    // Section 5: Skills (20 points)
    if (resumeData.skills && resumeData.skills.length > 0) {
      const skillCount = resumeData.skills.length;
      score += Math.min(20, skillCount * 2);

      if (skillCount >= 10) {
        feedback.push('Comprehensive skills list');
      } else {
        issues.push(`Add more skills (${10 - skillCount} more recommended)`);
      }
    } else {
      issues.push('Add your professional skills');
    }

    // Section 6: Certifications & Additional (15 points)
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      score += 10;
      feedback.push('Impressive certifications');
    }

    if (resumeData.projects && resumeData.projects.length > 0) {
      score += 5;
      feedback.push('Great portfolio projects');
    }

    return {
      score: Math.min(100, score),
      maxScore: 100,
      percentage: Math.min(100, Math.round(score)),
      feedback,
      issues,
      suggestions: this.generateSuggestions(resumeData, score)
    };
  }

  /**
   * Generate optimization suggestions based on resume analysis
   */
  generateSuggestions(resumeData, score) {
    const suggestions = [];

    if (score < 50) {
      suggestions.push({
        priority: 'HIGH',
        title: 'Complete Your Profile',
        description: 'Your resume is incomplete. Add missing sections to improve visibility.'
      });
    }

    if (!resumeData.summary || resumeData.summary.length < 50) {
      suggestions.push({
        priority: 'HIGH',
        title: 'Write a Compelling Summary',
        description:
          'A strong professional summary helps employers quickly understand your expertise.'
      });
    }

    if (!resumeData.workExperience || resumeData.workExperience.length === 0) {
      suggestions.push({
        priority: 'HIGH',
        title: 'Highlight Work Experience',
        description: 'Add your work history with specific achievements and impacts.'
      });
    }

    if (!resumeData.skills || resumeData.skills.length < 5) {
      suggestions.push({
        priority: 'MEDIUM',
        title: 'Expand Your Skills',
        description: 'List all relevant technical and soft skills. Use industry keywords.'
      });
    }

    // Keyword analysis
    const keywords = this.extractKeywords(resumeData);
    if (keywords.length < 10) {
      suggestions.push({
        priority: 'MEDIUM',
        title: 'Use Industry Keywords',
        description:
          'Include industry-specific terms to improve searchability and ATS matching.'
      });
    }

    if (score < 60) {
      suggestions.push({
        priority: 'MEDIUM',
        title: 'Format for ATS',
        description:
          'Use standard formatting and sections for better Applicant Tracking System compatibility.'
      });
    }

    return suggestions;
  }

  /**
   * Extract relevant keywords from resume
   */
  extractKeywords(resumeData) {
    const keywords = new Set();

    if (resumeData.skills) {
      resumeData.skills.forEach((skill) => {
        keywords.add(skill);
      });
    }

    if (resumeData.workExperience) {
      resumeData.workExperience.forEach((exp) => {
        if (exp.title) keywords.add(exp.title);
      });
    }

    // Common technical keywords
    const techKeywords = [
      'JavaScript',
      'Python',
      'Java',
      'React',
      'Node.js',
      'SQL',
      'MongoDB',
      'AWS',
      'Docker',
      'Kubernetes'
    ];

    return Array.from(keywords);
  }

  /**
   * Compare resume with job description
   */
  compareWithJobDescription(resumeData, jobDescription) {
    const resumeKeywords = this.extractKeywords(resumeData);
    const jobKeywords = jobDescription.split(/\s+/).filter((word) => word.length > 3);

    const matchedKeywords = resumeKeywords.filter((keyword) =>
      jobKeywords.some((jobWord) =>
        jobWord.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    const matchScore = Math.round(
      (matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 100
    );

    return {
      matchScore: Math.min(100, matchScore),
      matchedKeywords,
      missingKeywords: jobKeywords.slice(0, 10).filter(
        (keyword) =>
          !resumeKeywords.some((rKeyword) =>
            rKeyword.toLowerCase().includes(keyword.toLowerCase())
          )
      )
    };
  }

  /**
   * Generate ATS compatibility score
   */
  getAtsCompatibilityScore(resumeData) {
    let atsScore = 0;

    // File format check (assuming resume is properly uploaded)
    atsScore += 10;

    // Structure check
    if (
      resumeData.personalInfo &&
      resumeData.workExperience &&
      resumeData.education &&
      resumeData.skills
    ) {
      atsScore += 30;
    }

    // Content check
    if (resumeData.summary && resumeData.summary.length > 50) atsScore += 20;
    if (resumeData.workExperience && resumeData.workExperience.length > 0) atsScore += 20;
    if (resumeData.skills && resumeData.skills.length > 0) atsScore += 20;

    return Math.min(100, atsScore);
  }
}

module.exports = new AiResumeScorer();
