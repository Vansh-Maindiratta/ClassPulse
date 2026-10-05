const SYSTEM_PROMPT =
  "You summarize existing academic data only. Never invent attendance, grades, deadlines, classes, or curriculum. Keep replies to 2-3 short sentences. If data is missing, say there is not enough data for an insight yet.";

function fallbackStudentInsight(payload) {
  const { overallAttendance, pendingCount, lowestSubject, pendingNear } =
    payload;

  if (overallAttendance == null && pendingCount == null) {
    return "Not enough data for an AI insight yet.";
  }

  const parts = [];

  if (overallAttendance != null && overallAttendance < 75) {
    parts.push(
      `Your attendance is currently ${overallAttendance}%${
        lowestSubject
          ? `, with ${lowestSubject.name} at ${lowestSubject.percent}%`
          : ""
      }. Try attending upcoming classes regularly.`
    );
  }

  if (pendingCount > 2) {
    parts.push(
      "You have several pending activities. Consider completing the closest deadline first."
    );
  } else if (pendingNear) {
    parts.push(
      `You have a pending ${pendingNear.type} for ${pendingNear.subject} due ${pendingNear.dueLabel}. Completing it on time will keep your workload lighter.`
    );
  }

  if (!parts.length) {
    return "Your attendance and activities look on track. Keep up the current pace this week.";
  }

  return parts.join(" ");
}

function fallbackFacultyInsight(payload) {
  const { subjectName, attendancePercent, activityCompletion } = payload;

  if (attendancePercent == null && activityCompletion == null) {
    return "Not enough data for an AI insight yet.";
  }

  if (activityCompletion != null && activityCompletion < 60) {
    return `${subjectName || "This subject"} attendance is ${
      attendancePercent ?? "available"
    }${
      typeof attendancePercent === "number" ? "%" : ""
    }, but activity completion is currently lower. Consider checking whether students need additional guidance.`;
  }

  if (attendancePercent != null && attendancePercent < 75) {
    return `${subjectName || "Class"} attendance is currently ${attendancePercent}%. A short reminder about upcoming sessions may help.`;
  }

  return `${subjectName || "Your class"} looks healthy overall. Keep monitoring activity completion alongside attendance.`;
}

function fallbackSummary(text) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Not enough data for an AI insight yet.";
  }

  const sentence = cleaned.split(/[.!?]/)[0].trim();
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
}

async function callProvider(userPrompt) {
  const apiKey = process.env.AI_API_KEY;
  const url = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!apiKey) return null;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 180,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("provider_failed");
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function studentInsight(payload) {
  const prompt = `Interpret this student data only. Do not add numbers that are not listed.\n${JSON.stringify(payload)}`;

  try {
    const result = await callProvider(prompt);
    if (result) return { text: result, source: "ai" };
  } catch {
    // Fall through to deterministic copy.
  }

  return { text: fallbackStudentInsight(payload), source: "fallback" };
}

export async function facultyInsight(payload) {
  const prompt = `Interpret this faculty class data only. Do not add numbers that are not listed.\n${JSON.stringify(payload)}`;

  try {
    const result = await callProvider(prompt);
    if (result) return { text: result, source: "ai" };
  } catch {
    // Fall through to deterministic copy.
  }

  return { text: fallbackFacultyInsight(payload), source: "fallback" };
}

export async function summarizeActivity(text) {
  const prompt = `Rewrite this activity description in one clear sentence for students. Do not add deadlines or details that are not present.\n${text}`;

  try {
    const result = await callProvider(prompt);
    if (result) return { text: result, source: "ai" };
  } catch {
    // Fall through to deterministic copy.
  }

  return { text: fallbackSummary(text), source: "fallback" };
}
