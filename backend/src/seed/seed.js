import "dotenv/config";
import mongoose from "mongoose";
import { connectDb, logDbFailure } from "../config/db.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import ClassModel from "../models/Class.js";
import Curriculum from "../models/Curriculum.js";
import Activity from "../models/Activity.js";
import Attendance from "../models/Attendance.js";
import { hashPassword } from "../services/authService.js";

/**
 * ClassPulse demo data seeder (development only).
 *
 * - `npm run seed`         → seeds an empty database, refuses to touch data that already exists
 * - `npm run seed:reset`   → clears ClassPulse collections, then seeds fresh demo data
 *
 * All people, emails, and records below are fictional. Attendance is generated with a
 * deterministic pseudo-random generator so every reseed produces the same dataset.
 */

const RESET = process.argv.includes("--reset");
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SESSIONS_BACK_WEEKS = 6;

function makeRandom(seed = 42) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = makeRandom();

function todayAtNoon() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date;
}

function offsetDays(days) {
  const date = todayAtNoon();
  date.setDate(date.getDate() + days);
  return date;
}

/** Past session dates (oldest first) for a weekly schedule, excluding today and the future. */
function sessionDates(days) {
  const today = todayAtNoon();
  const dates = [];
  for (let offset = 1; offset <= SESSIONS_BACK_WEEKS * 7; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    if (days.includes(WEEKDAYS[date.getDay()])) dates.push(date);
  }
  return dates;
}

// ---------------------------------------------------------------------------
// Fictional demo people
// ---------------------------------------------------------------------------

const studentPlan = [
  { name: "Demo Student", email: "student.demo@classpulse.local", rate: 0.84, adjust: { OS: 0.8 } },
  { name: "Aarav Sharma", email: "aarav.sharma@college.edu", rate: 0.93 },
  { name: "Karan Mehta", email: "karan.mehta@college.edu", rate: 0.9 },
  { name: "Ananya Patil", email: "ananya.patil@college.edu", rate: 0.88 },
  { name: "Riya Deshmukh", email: "riya.deshmukh@college.edu", rate: 0.86 },
  { name: "Neha Joshi", email: "neha.joshi@college.edu", rate: 0.81 },
  { name: "Sanskar Amle", email: "sanskar.amle@college.edu", rate: 0.79 },
  { name: "Rohan Kulkarni", email: "rohan.kulkarni@college.edu", rate: 0.76 },
  { name: "Vivaan Patil", email: "vivaan.patil@college.edu", rate: 0.74 },
  { name: "Aditya Joshi", email: "aditya.joshi@college.edu", rate: 0.71 },
  { name: "Sneha Kadam", email: "sneha.kadam@college.edu", rate: 0.67 },
  { name: "Ishita Rao", email: "ishita.rao@college.edu", rate: 0.62 },
];

const facultyPlan = [
  { key: "teacher", name: "Demo Teacher", email: "teacher.demo@classpulse.local" },
  { key: "priya", name: "Dr. Priya Sharma", email: "priya.sharma@college.edu" },
  { key: "rahul", name: "Prof. Rahul Joshi", email: "rahul.joshi@college.edu" },
];

const adminPlan = { name: "Meera Kulkarni", email: "admin@classpulse.edu" };

// ---------------------------------------------------------------------------
// Subjects, classes, curriculum
// ---------------------------------------------------------------------------

const subjectPlan = [
  { code: "DSA", name: "Data Structures", faculty: "priya" },
  { code: "DBMS", name: "Database Management Systems", faculty: "rahul" },
  { code: "CN", name: "Computer Networks", faculty: "priya" },
  { code: "OS", name: "Operating Systems", faculty: "teacher" },
  { code: "WEB", name: "Web Development", faculty: "teacher" },
  { code: "MATH", name: "Mathematics", faculty: "rahul" },
];

const classPlan = [
  { code: "DSA", section: "CSE-A", room: "A-204", days: ["Mon", "Wed", "Fri"], time: "09:00 AM" },
  { code: "DBMS", section: "CSE-A", room: "B-102", days: ["Mon", "Wed", "Fri"], time: "11:00 AM" },
  { code: "CN", section: "CSE-A", room: "C-110", days: ["Tue", "Thu"], time: "10:00 AM" },
  { code: "OS", section: "CSE-A", room: "Lab 3", days: ["Tue", "Fri"], time: "02:00 PM" },
  { code: "WEB", section: "CSE-A", room: "Lab 1", days: ["Tue", "Thu"], time: "01:00 PM" },
  { code: "MATH", section: "CSE-A", room: "A-101", days: ["Mon", "Thu"], time: "03:00 PM" },
];

const curriculumPlan = [
  {
    code: "DSA",
    units: [
      { title: "Unit 1 · Foundations", topics: [["Arrays", "completed"], ["Complexity Analysis", "completed"], ["Searching & Sorting", "completed"]] },
      { title: "Unit 2 · Linear Structures", topics: [["Linked Lists", "completed"], ["Stacks & Queues", "completed"], ["Hashing", "completed"]] },
      { title: "Unit 3 · Trees & Graphs", topics: [["Trees", "in-progress"], ["Graphs", "pending"], ["Greedy Methods", "pending"]] },
    ],
  },
  {
    code: "DBMS",
    units: [
      { title: "Unit 1 · Modelling", topics: [["ER Models", "completed"], ["Relational Algebra", "completed"], ["Schema Design", "completed"]] },
      { title: "Unit 2 · Querying", topics: [["SQL Queries", "completed"], ["Joins & Views", "completed"], ["Transactions", "in-progress"]] },
      { title: "Unit 3 · Advanced", topics: [["Normalization", "in-progress"], ["Indexing", "pending"], ["Concurrency", "pending"]] },
    ],
  },
  {
    code: "CN",
    units: [
      { title: "Unit 1 · Foundations", topics: [["OSI Model", "completed"], ["TCP/IP", "completed"], ["Encapsulation", "completed"]] },
      { title: "Unit 2 · Routing", topics: [["Routing Algorithms", "completed"], ["Switching", "in-progress"], ["Congestion Control", "pending"]] },
      { title: "Unit 3 · Applications", topics: [["DNS & HTTP", "in-progress"], ["Network Security", "pending"], ["Wireless Networks", "pending"]] },
    ],
  },
  {
    code: "OS",
    units: [
      { title: "Unit 1 · Processes", topics: [["Processes", "completed"], ["Threads", "completed"], ["Scheduling", "completed"]] },
      { title: "Unit 2 · Memory", topics: [["Deadlocks", "in-progress"], ["Memory Management", "in-progress"], ["Virtual Memory", "pending"]] },
      { title: "Unit 3 · Storage", topics: [["File Systems", "in-progress"], ["I/O Systems", "pending"], ["Protection", "pending"]] },
    ],
  },
  {
    code: "WEB",
    units: [
      { title: "Unit 1 · Frontend Basics", topics: [["HTML Semantics", "completed"], ["CSS Layout", "completed"], ["Responsive Design", "in-progress"]] },
      { title: "Unit 2 · JavaScript", topics: [["DOM Events", "in-progress"], ["Fetch & APIs", "pending"], ["State Basics", "pending"]] },
      { title: "Unit 3 · Full Stack", topics: [["REST APIs", "pending"], ["Deployment", "pending"], ["Accessibility", "pending"]] },
    ],
  },
  {
    code: "MATH",
    units: [
      { title: "Unit 1 · Discrete Maths", topics: [["Sets & Relations", "completed"], ["Functions", "completed"], ["Propositional Logic", "completed"]] },
      { title: "Unit 2 · Graph Theory", topics: [["Graphs", "completed"], ["Trees & Counting", "completed"], ["Recurrence Relations", "completed"]] },
      { title: "Unit 3 · Probability", topics: [["Probability", "completed"], ["Distributions", "in-progress"], ["Statistics", "pending"]] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Activities (due dates are relative to today so states always look current)
// ---------------------------------------------------------------------------

const activityPlan = [
  { code: "DBMS", faculty: "rahul", title: "Normalization Practice Sheet", description: "Convert the supplied schemas to 3NF and BCNF.", type: "assignment", dueIn: -4, status: "overdue" },
  { code: "DBMS", faculty: "rahul", title: "Library Schema Mini Project", description: "Design a small schema for a library system.", type: "project", dueIn: -1, status: "overdue" },
  { code: "OS", faculty: "teacher", title: "CPU Scheduling Lab", description: "Implement and compare three scheduling algorithms.", type: "lab", dueIn: -6, status: "submitted" },
  { code: "CN", faculty: "priya", title: "Subnetting Worksheet", description: "Subnetting exercises for class CSE-A.", type: "tutorial", dueIn: -2, status: "submitted" },
  { code: "MATH", faculty: "rahul", title: "Probability Problem Set", description: "Practice problems on conditional probability.", type: "assignment", dueIn: -5, status: "completed" },
  { code: "WEB", faculty: "teacher", title: "Responsive Layout Lab", description: "Rebuild a magazine layout using CSS grid.", type: "lab", dueIn: -3, status: "completed" },
  { code: "OS", faculty: "teacher", title: "Scheduling Algorithms Quiz", description: "Short quiz covering process scheduling.", type: "quiz", dueIn: 1, status: "pending" },
  { code: "DSA", faculty: "priya", title: "DSA Quiz 2 — Trees", description: "Short quiz on traversals and BST properties.", type: "quiz", dueIn: 2, status: "pending" },
  { code: "CN", faculty: "priya", title: "Wireshark Lab 4", description: "Capture and classify live network traffic.", type: "lab", dueIn: 3, status: "pending" },
  { code: "WEB", faculty: "teacher", title: "Portfolio Landing Page", description: "Ship a responsive landing page for your portfolio.", type: "project", dueIn: 4, status: "pending" },
  { code: "DSA", faculty: "priya", title: "Graph Traversal Assignment", description: "BFS and DFS on the sample graphs.", type: "assignment", dueIn: 6, status: "pending" },
  { code: "MATH", faculty: "rahul", title: "Graph Theory Seminar", description: "Five-minute talk on an application of graph theory.", type: "seminar", dueIn: 8, status: "pending" },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seed() {
  try {
    await connectDb(process.env.MONGODB_URI);
  } catch {
    logDbFailure();
    process.exit(1);
  }

  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers && !RESET) {
      console.error(
        "Seed stopped: the database already contains users, so nothing was changed.\n" +
          "Use an empty development database, or run `npm run seed:reset` to replace the demo data."
      );
      await mongoose.disconnect();
      process.exitCode = 1;
      return;
    }

    if (RESET) {
      await Promise.all([
        User.deleteMany({}),
        Subject.deleteMany({}),
        ClassModel.deleteMany({}),
        Curriculum.deleteMany({}),
        Activity.deleteMany({}),
        Attendance.deleteMany({}),
      ]);
      console.log("Existing ClassPulse data cleared (--reset).");
    }

    const passwordHash = await hashPassword(process.env.DEMO_PASSWORD || "DemoPass123!");

    const facultyByKey = new Map(facultyPlan.map((person) => [person.key, person]));

    const userDocs = await User.insertMany([
      ...studentPlan.map((student) => ({
        name: student.name,
        email: student.email,
        role: "student",
        passwordHash,
      })),
      ...facultyPlan.map((person) => ({
        name: person.name,
        email: person.email,
        role: "faculty",
        passwordHash,
      })),
      { name: adminPlan.name, email: adminPlan.email, role: "admin", passwordHash },
    ]);
    const userByEmail = new Map(userDocs.map((user) => [user.email, user]));

    const subjectDocs = await Subject.insertMany(
      subjectPlan.map((subject) => ({
        name: subject.name,
        code: subject.code,
        faculty: userByEmail.get(facultyByKey.get(subject.faculty).email)._id,
      }))
    );
    const subjectByCode = new Map(subjectDocs.map((subject) => [subject.code, subject]));

    await ClassModel.insertMany(
      classPlan.map((item) => ({
        subject: subjectByCode.get(item.code)._id,
        faculty: subjectByCode.get(item.code).faculty,
        section: item.section,
        room: item.room,
        schedule: { days: item.days, time: item.time },
      }))
    );

    await Curriculum.insertMany(
      curriculumPlan.map((item) => ({
        subject: subjectByCode.get(item.code)._id,
        units: item.units.map((unit) => ({
          title: unit.title,
          topics: unit.topics.map(([title, status]) => ({ title, status })),
        })),
      }))
    );

    const activityDocs = await Activity.insertMany(
      activityPlan.map((item) => ({
        title: item.title,
        description: item.description,
        subject: subjectByCode.get(item.code)._id,
        type: item.type,
        dueDate: offsetDays(item.dueIn),
        createdBy: userByEmail.get(facultyByKey.get(item.faculty).email)._id,
        status: item.status,
      }))
    );

    // Attendance: one record per student, subject, and past scheduled session.
    const attendanceDocs = [];
    for (const student of studentPlan) {
      const studentId = userByEmail.get(student.email)._id;
      for (const item of classPlan) {
        const subject = subjectByCode.get(item.code);
        const rate = Math.min(0.99, student.rate * (student.adjust?.[item.code] ?? 1));
        for (const date of sessionDates(item.days)) {
          attendanceDocs.push({
            student: studentId,
            subject: subject._id,
            date,
            status: random() < rate ? "present" : "absent",
          });
        }
      }
    }
    await Attendance.insertMany(attendanceDocs);

    console.log("Demo data seeded successfully.");
    console.log(
      `Students: ${studentPlan.length} | Teachers: ${facultyPlan.length} | Admin: 1 | ` +
        `Subjects: ${subjectDocs.length} | Classes: ${classPlan.length} | ` +
        `Activities: ${activityDocs.length} | Attendance records: ${attendanceDocs.length}`
    );
    console.log("Demo sign-ins (local development only):");
    console.log("  Student  student.demo@classpulse.local");
    console.log("  Teacher  teacher.demo@classpulse.local");
    console.log(
      process.env.DEMO_PASSWORD
        ? "  Password  (the DEMO_PASSWORD configured in backend/.env)"
        : "  Password  DemoPass123!"
    );
    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed failed.");
    console.error(error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
