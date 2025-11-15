// Mock data for admin dashboard

export const mockUsageData = {
  kpis: {
    totalSessions: 1247,
    activeUsers: {
      dau: 48,
      wau: 156,
      mau: 342,
    },
    avgSessionDuration: 6.2, // minutes
    sessionsPerUser: 3.6,
  },
  sessionsOverTime: [
    { date: '2024-01', sessions: 145 },
    { date: '2024-02', sessions: 189 },
    { date: '2024-03', sessions: 234 },
    { date: '2024-04', sessions: 267 },
    { date: '2024-05', sessions: 412 },
  ],
  sessionsByDepartment: [
    { department: 'Engineering', sessions: 423 },
    { department: 'Sales', sessions: 312 },
    { department: 'Marketing', sessions: 201 },
    { department: 'HR', sessions: 156 },
    { department: 'Operations', sessions: 155 },
  ],
  scenarioDistribution: [
    { scenario: 'Conflict Resolution', value: 28, count: 349 },
    { scenario: 'Delicate Request', value: 22, count: 274 },
    { scenario: 'Warning Worker', value: 19, count: 237 },
    { scenario: 'Reporting Upward', value: 18, count: 224 },
    { scenario: 'Firing Simulation', value: 13, count: 163 },
  ],
};

export const mockSkillData = {
  aggregateSkills: [
    { skill: 'Confidence', value: 78 },
    { skill: 'Clarity', value: 82 },
    { skill: 'Empathy', value: 75 },
    { skill: 'Assertiveness', value: 71 },
    { skill: 'Stress Management', value: 68 },
  ],
  skillTrendsOverTime: {
    confidence: [
      { month: 'Jan', value: 65 },
      { month: 'Feb', value: 68 },
      { month: 'Mar', value: 72 },
      { month: 'Apr', value: 75 },
      { month: 'May', value: 78 },
    ],
    clarity: [
      { month: 'Jan', value: 70 },
      { month: 'Feb', value: 74 },
      { month: 'Mar', value: 77 },
      { month: 'Apr', value: 80 },
      { month: 'May', value: 82 },
    ],
    empathy: [
      { month: 'Jan', value: 68 },
      { month: 'Feb', value: 70 },
      { month: 'Mar', value: 72 },
      { month: 'Apr', value: 74 },
      { month: 'May', value: 75 },
    ],
  },
  teamComparison: [
    { team: 'Engineering', confidence: 80, clarity: 85, empathy: 72, assertiveness: 75, stress: 70 },
    { team: 'Sales', confidence: 82, clarity: 78, empathy: 76, assertiveness: 80, stress: 68 },
    { team: 'Marketing', confidence: 76, clarity: 80, empathy: 78, assertiveness: 68, stress: 72 },
    { team: 'HR', confidence: 75, clarity: 82, empathy: 85, assertiveness: 70, stress: 75 },
  ],
};

export const mockScenarioData = {
  conflictResolution: {
    score: 76,
    emotionalRegulation: 72,
  },
  delicateRequest: {
    persuasiveness: 78,
    politeness: 84,
  },
  warningWorker: {
    toneAppropriateness: 74,
    feedbackQuality: 79,
  },
  reportingUpward: {
    clarity: 82,
    conciseness: 80,
    dataStructuring: 77,
  },
  firingSimulation: {
    sensitivity: 81,
    legalSafety: 88,
  },
  performanceHeatmap: [
    { user: 'Alice Johnson', p2: 85, p3: 78, p4: 82, p5: 88, p6: 90 },
    { user: 'Bob Smith', p2: 72, p3: 75, p4: 70, p5: 78, p6: 76 },
    { user: 'Carol Davis', p2: 88, p3: 92, p4: 85, p5: 90, p6: 87 },
    { user: 'David Lee', p2: 65, p3: 68, p4: 72, p5: 70, p6: 69 },
    { user: 'Emma Wilson', p2: 90, p3: 88, p4: 92, p5: 95, p6: 93 },
  ],
};

export const mockTeamProgress = {
  topImprovers: [
    { name: 'Emma Wilson', department: 'Sales', improvement: '+32%', currentScore: 92 },
    { name: 'Michael Chen', department: 'Engineering', improvement: '+28%', currentScore: 88 },
    { name: 'Sarah Parker', department: 'Marketing', improvement: '+25%', currentScore: 85 },
    { name: 'James Taylor', department: 'HR', improvement: '+22%', currentScore: 83 },
    { name: 'Lisa Anderson', department: 'Operations', improvement: '+20%', currentScore: 81 },
  ],
  needsSupport: [
    { name: 'David Lee', department: 'Engineering', score: 65, sessions: 12, lastActive: '2 days ago' },
    { name: 'Tom Harris', department: 'Sales', score: 62, sessions: 8, lastActive: '5 days ago' },
    { name: 'Nina Patel', department: 'Marketing', score: 68, sessions: 10, lastActive: '3 days ago' },
  ],
  skillGrowth: [
    { month: 'Jan', avgScore: 68 },
    { month: 'Feb', avgScore: 71 },
    { month: 'Mar', avgScore: 74 },
    { month: 'Apr', avgScore: 77 },
    { month: 'May', avgScore: 80 },
  ],
};

export const mockFinancialData = {
  aiCosts: {
    llmCostPerMinute: 0.001,
    voiceCostPerMinute: 0.10,
    costPerSession: 0.606, // 6 min avg
    costPerUserPerMonth: 7.56,
    totalMonthlyCost: 378, // 50 users
  },
  savings: {
    traditionalCoachingCost: 80,
    savingsPerSession: 79.394,
    savingsPercentage: 99,
    annualSavingsPerCompany: 94800,
    timesSavedPerMonth: 180, // hours
  },
  costVsTraditional: [
    { type: 'AI Training', cost: 0.606 },
    { type: 'Traditional Coaching', cost: 80 },
  ],
  projectedSavings: [
    { month: 'Month 1', savings: 7900 },
    { month: 'Month 3', savings: 23700 },
    { month: 'Month 6', savings: 47400 },
    { month: 'Month 9', savings: 71100 },
    { month: 'Month 12', savings: 94800 },
  ],
  costBreakdown: [
    { category: 'LLM Processing', value: 6, amount: 22.68 },
    { category: 'Voice Synthesis', value: 91, amount: 343.98 },
    { category: 'Infrastructure', value: 3, amount: 11.34 },
  ],
  departmentCosts: [
    { department: 'Engineering', users: 15, monthlyCost: 113.4, savings: 28400 },
    { department: 'Sales', users: 12, monthlyCost: 90.72, savings: 22800 },
    { department: 'Marketing', users: 10, monthlyCost: 75.6, savings: 19000 },
    { department: 'HR', users: 8, monthlyCost: 60.48, savings: 15200 },
    { department: 'Operations', users: 5, monthlyCost: 37.8, savings: 9400 },
  ],
};

export const mockComplianceData = {
  qualityMetrics: {
    transcriptionAccuracy: 97.8,
    sentimentAccuracy: 94.2,
    responseRelevance: 92.5,
    averageLatency: 1.2, // seconds
  },
  complianceChecks: [
    { check: 'Data Privacy Compliance', status: 'Pass', lastChecked: '2024-05-15' },
    { check: 'AI Ethics Guidelines', status: 'Pass', lastChecked: '2024-05-14' },
    { check: 'GDPR Compliance', status: 'Pass', lastChecked: '2024-05-13' },
    { check: 'Bias Detection', status: 'Pass', lastChecked: '2024-05-12' },
  ],
  userFeedback: {
    averageRating: 4.6,
    totalResponses: 342,
    recommendationRate: 89,
  },
};
