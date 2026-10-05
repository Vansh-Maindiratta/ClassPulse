export type Role = "student" | "faculty" | "admin";

export type TopicStatus = "pending" | "in-progress" | "completed";
export type ActivityType =
  | "assignment"
  | "quiz"
  | "lab"
  | "project"
  | "seminar"
  | "tutorial";
export type ActivityStatus = "pending" | "submitted" | "completed" | "overdue";
export type AttendanceStatus = "present" | "absent";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  faculty: User | string;
}

export interface ClassSession {
  _id: string;
  subject: Pick<Subject, "_id" | "name" | "code">;
  faculty: Pick<User, "_id" | "name" | "email">;
  section: string;
  room: string;
  schedule: {
    days: string[];
    time: string;
  };
}

export interface Topic {
  _id: string;
  title: string;
  status: TopicStatus;
}

export interface Unit {
  _id: string;
  title: string;
  topics: Topic[];
}

export interface Curriculum {
  _id: string;
  subject: Subject;
  units: Unit[];
  progress: number;
}

export interface Activity {
  _id: string;
  title: string;
  description: string;
  subject: Pick<Subject, "_id" | "name" | "code">;
  type: ActivityType;
  dueDate: string;
  createdBy: Pick<User, "_id" | "name" | "role">;
  status: ActivityStatus;
}

export interface AttendanceRecord {
  _id: string;
  student: Pick<User, "_id" | "name" | "email">;
  subject: Pick<Subject, "_id" | "name" | "code">;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceForecast {
  current: number;
  estimated: number;
  upcoming: number;
  attended: number;
  total: number;
}

export interface StudentAttendanceStat {
  student: Pick<User, "_id" | "name" | "email">;
  attended: number;
  total: number;
  percent: number;
  belowThreshold: boolean;
}

export interface AttendanceSummary {
  overall: number;
  attended: number;
  total: number;
  forecast: AttendanceForecast;
  bySubject: {
    subject: Pick<Subject, "_id" | "name" | "code">;
    attended: number;
    total: number;
    percent: number;
    forecast: AttendanceForecast;
  }[];
}

export interface AIResult {
  text: string;
  source: "ai" | "fallback";
}

export interface AcademicRisk {
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "INSUFFICIENT_DATA";
  reasons: string[];
  recommendations: string[];
  dataCoverage: string[];
}
