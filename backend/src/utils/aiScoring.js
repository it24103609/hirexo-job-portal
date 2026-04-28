const DEFAULT_AI_SCORING = {
  skillsWeight: 60,
  experienceWeight: 20,
  locationWeight: 10,
  profileWeight: 10,
  highFitThreshold: 80,
  moderateFitThreshold: 60
};

function normalizeTerms(values = []) {
  return values
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);
}

function resolveExperienceTarget(experienceLevel = '') {
  const text = String(experienceLevel || '').toLowerCase();
  const firstNumber = Number(text.match(/\d+/)?.[0]);
  return Number.isFinite(firstNumber) ? firstNumber : null;
}

function calculateAiFit(job, profile = {}, scoringConfig = DEFAULT_AI_SCORING) {
  const safeConfig = { ...DEFAULT_AI_SCORING, ...(scoringConfig || {}) };
  const totalWeight = Math.max(
    1,
    Number(safeConfig.skillsWeight || 0)
      + Number(safeConfig.experienceWeight || 0)
      + Number(safeConfig.locationWeight || 0)
      + Number(safeConfig.profileWeight || 0)
  );

  const weightedPortion = (rawScore, weight) => Math.round((Math.max(0, Math.min(100, rawScore)) * Number(weight || 0)) / totalWeight);

  const jobSkills = normalizeTerms(job?.skills || []);
  const candidateSkills = normalizeTerms(profile?.skills || []);

  const overlappingSkills = jobSkills.filter((skill) => candidateSkills.includes(skill));
  const missingSkills = jobSkills.filter((skill) => !candidateSkills.includes(skill));

  const skillsRaw = jobSkills.length
    ? Math.round((overlappingSkills.length / jobSkills.length) * 100)
    : Math.min(100, candidateSkills.length * 15);

  const targetExperience = resolveExperienceTarget(job?.experienceLevel);
  const years = Number(profile?.experienceYears || 0);
  const experienceRaw = targetExperience === null
    ? Math.min(100, years * 12)
    : years >= targetExperience
      ? 100
      : Math.max(0, 100 - (targetExperience - years) * 30);

  const profileLocation = String(profile?.location || '').toLowerCase();
  const jobLocation = String(job?.location || '').toLowerCase();
  const locationRaw = job?.remoteFriendly
    ? 10
    : profileLocation && jobLocation && profileLocation.includes(jobLocation)
      ? 10
      : 3;

  const completenessChecks = [
    Boolean(profile?.headline),
    Boolean(profile?.summary),
    candidateSkills.length > 0,
    years > 0,
    Array.isArray(profile?.education) && profile.education.length > 0
  ];
  const completenessRaw = Math.round((completenessChecks.filter(Boolean).length / completenessChecks.length) * 100);

  const skillsScore = weightedPortion(skillsRaw, safeConfig.skillsWeight);
  const experienceScore = weightedPortion(experienceRaw, safeConfig.experienceWeight);
  const locationScore = weightedPortion(locationRaw * 10, safeConfig.locationWeight);
  const completenessScore = weightedPortion(completenessRaw, safeConfig.profileWeight);

  const score = Math.max(0, Math.min(100, skillsScore + experienceScore + locationScore + completenessScore));
  const label = score >= safeConfig.highFitThreshold ? 'High fit' : score >= safeConfig.moderateFitThreshold ? 'Moderate fit' : 'Low fit';

  return {
    score,
    label,
    breakdown: {
      skills: skillsScore,
      experience: experienceScore,
      location: locationScore,
      profile: completenessScore
    },
    matchedSkills: overlappingSkills,
    missingSkills,
    targetExperience,
    candidateExperience: years,
    profileCompleteness: completenessRaw,
    locationMatched: Boolean(job?.remoteFriendly || (profileLocation && jobLocation && profileLocation.includes(jobLocation)))
  };
}

function buildAiExplanation(job, profile = {}, scoringConfig = DEFAULT_AI_SCORING) {
  const fit = calculateAiFit(job, profile, scoringConfig);
  const highlights = [];
  const concerns = [];

  if (fit.matchedSkills.length) {
    highlights.push(`Matched skills: ${fit.matchedSkills.slice(0, 4).join(', ')}`);
  }

  if (fit.targetExperience === null) {
    if (fit.candidateExperience > 0) {
      highlights.push(`${fit.candidateExperience} years of recorded experience`);
    }
  } else if (fit.candidateExperience >= fit.targetExperience) {
    highlights.push(`Experience meets target (${fit.candidateExperience}/${fit.targetExperience}+ years)`);
  } else {
    concerns.push(`Experience gap of ${fit.targetExperience - fit.candidateExperience} year(s)`);
  }

  if (fit.locationMatched) {
    highlights.push(job?.remoteFriendly ? 'Location works well for remote hiring' : 'Candidate location aligns with job location');
  } else if (job?.location) {
    concerns.push(`Location alignment is weak for ${job.location}`);
  }

  if (fit.profileCompleteness >= 80) {
    highlights.push('Candidate profile is well completed');
  } else {
    concerns.push('Profile still misses some useful details');
  }

  if (fit.missingSkills.length) {
    concerns.push(`Missing key skills: ${fit.missingSkills.slice(0, 3).join(', ')}`);
  }

  const recommendedAction = fit.score >= 80
    ? 'Fast-track to shortlist or schedule an interview.'
    : fit.score >= 60
      ? 'Review manually and validate the missing gaps during screening.'
      : 'Keep in backup pool unless the role criteria are flexible.';

  return {
    score: fit.score,
    label: fit.label,
    breakdown: fit.breakdown,
    matchedSkills: fit.matchedSkills,
    missingSkills: fit.missingSkills,
    highlights,
    concerns,
    recommendedAction,
    summary: `${fit.label} candidate with a ${fit.score}% overall match.`,
    meta: {
      targetExperience: fit.targetExperience,
      candidateExperience: fit.candidateExperience,
      profileCompleteness: fit.profileCompleteness,
      locationMatched: fit.locationMatched
    }
  };
}

module.exports = {
  DEFAULT_AI_SCORING,
  calculateAiFit,
  buildAiExplanation
};
