export const RISK_WEIGHTS = Object.freeze({
  attendance: 40,
  academicPerformance: 30,
  assignmentCompletion: 15,
  activityCompletion: 15,
});

export function analyzeAcademicRisk({ attendancePercent, averageMark, pendingAssignments, activityCompletion }) {
  let score = 0;
  const reasons = [];
  const recommendations = [];
  const availableFactors = [];
  let availableWeight = 0;

  if (Number.isFinite(attendancePercent)) {
    availableFactors.push("attendance");
    availableWeight += RISK_WEIGHTS.attendance;
    if (attendancePercent < 75) {
      score += RISK_WEIGHTS.attendance * Math.min(1, (75 - Math.max(0, attendancePercent)) / 25);
      reasons.push(`Attendance is below the recommended 75% (${Math.round(attendancePercent)}%).`);
      recommendations.push("Attend upcoming classes consistently to improve attendance.");
    }
  }
  if (Number.isFinite(averageMark)) {
    availableFactors.push("academicPerformance");
    availableWeight += RISK_WEIGHTS.academicPerformance;
    if (averageMark < 60) {
      score += RISK_WEIGHTS.academicPerformance * Math.min(1, (60 - Math.max(0, averageMark)) / 60);
      reasons.push(`Recent academic performance is below 60% (${Math.round(averageMark)}%).`);
      recommendations.push("Review recent assessment feedback and ask faculty about topics that need practice.");
    }
  }
  if (Number.isFinite(pendingAssignments)) {
    availableFactors.push("assignmentCompletion");
    availableWeight += RISK_WEIGHTS.assignmentCompletion;
    if (pendingAssignments > 0) {
      score += RISK_WEIGHTS.assignmentCompletion * Math.min(1, pendingAssignments / 3);
      reasons.push(`${pendingAssignments} assignment${pendingAssignments === 1 ? " is" : "s are"} incomplete.`);
      recommendations.push("Complete the closest pending assignment first.");
    }
  }
  if (Number.isFinite(activityCompletion)) {
    availableFactors.push("activityCompletion");
    availableWeight += RISK_WEIGHTS.activityCompletion;
    if (activityCompletion < 70) {
      score += RISK_WEIGHTS.activityCompletion * Math.min(1, (70 - Math.max(0, activityCompletion)) / 70);
      reasons.push(`Curriculum activity completion is ${Math.round(activityCompletion)}%, below the 70% target.`);
      recommendations.push("Make steady progress on the remaining curriculum activities.");
    }
  }

  const riskScore = Math.round(availableWeight ? Math.min(100, (score / availableWeight) * 100) : 0);
  const riskLevel = !availableFactors.length ? "INSUFFICIENT_DATA" : riskScore >= 60 ? "HIGH" : riskScore >= 25 ? "MODERATE" : "LOW";
  if (!reasons.length && availableFactors.length) recommendations.push("Keep up the current progress and check in again after your next assessment.");
  return { riskScore, riskLevel, reasons, recommendations, dataCoverage: availableFactors };
}
