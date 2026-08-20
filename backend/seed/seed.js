// Seeds the MongoDB with sample courses for development/testing.
// Run with: npm run seed (from root or backend/)
import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "../models/Course.js";

dotenv.config();

const subjects = ["Mathematics", "Science", "English", "Coding", "Art", "Music"];
const grades = ["Grade 1-2", "Grade 3-5", "Grade 6-8", "Grade 9-10", "Grade 11-12"];
const teachers = [
  "Ms. Priya Sharma",
  "Mr. Arvind Iyer",
  "Mrs. Sarah Fernandes",
  "Mr. Tariq Khan",
  "Ms. Ananya Rao",
  "Dr. Rajesh Gupta",
  "Mr. Sourav Das",
  "Mrs. Maya Nair",
  "Ms. Neha Verma",
  "Mr. Rohan Joshi",
];

const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randNum = (min, max, decimals = 0) =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));

const courseNamesBySubject = {
  Mathematics: [
    "Algebra Foundations & Mental Math",
    "Geometry Essentials & Visual Thinking",
    "Vedic Math Speed Arithmetic",
    "High School Calculus & Conics",
  ],
  Science: [
    "Physics in Everyday Life & Experiments",
    "Hands-on Chemistry Lab Skills",
    "Human Biology & Physiology 101",
    "Astronomy & Space Exploration",
  ],
  English: [
    "Creative Writing & Story Crafting",
    "Grammar Mastery & Vocabulary Booster",
    "Public Speaking & Debate Championship",
    "Speed Reading & Critical Comprehension",
  ],
  Coding: [
    "Robotics & Scratch Block Coding",
    "Python Coding Adventures for Kids",
    "Web Development Bootcamp: HTML, CSS & JS",
    "Game Dev Fundamentals with 2D Physics",
  ],
  Art: [
    "Watercolor Painting & Landscape Art",
    "Sketching Fundamentals & Shading",
    "Digital Art & Graphic Design Basics",
    "Paper Craft & Collage Workshop",
  ],
  Music: [
    "Keyboard & Piano Fundamentals",
    "Acoustic Guitar for Beginners",
    "Vocal Training & Voice Modulation",
    "Music Theory & Rhythm Clapping 101",
  ],
};

const generateCourses = (count) =>
  Array.from({ length: count }, () => {
    const subject = randOf(subjects);
    const grade = randOf(grades);
    const teacher = randOf(teachers);
    const rating = randNum(3.8, 5.0, 1);
    const price = Math.round(randNum(999, 4999) / 100) * 100 - 1; // e.g. 1499, 2999

    return {
      name: randOf(courseNamesBySubject[subject]),
      subject,
      grade,
      teacher,
      teacherRating: rating,
      price,
      duration: "4-6 Weeks (8-12 Live Classes)",
      schedule: "Tue & Thu, 5:00 PM - 6:00 PM IST",
      availableSlots: [
        "Mon & Wed: 4:00 PM - 5:00 PM",
        "Tue & Thu: 5:00 PM - 6:00 PM",
        "Sat & Sun: 11:00 AM - 12:00 PM",
      ],
      description: `A hands-on ${subject.toLowerCase()} course designed to build strong fundamentals, confidence, and conceptual clarity through interactive weekly sessions.`,
      highlights: [
        "1-on-1 personalized doubt clearing",
        "Interactive exercises & live feedback",
        "Weekly parent progress report",
        "Course completion certificate",
      ],
      syllabus: [
        { week: "Week 1", topic: "Core Fundamentals", detail: "Introduction, core concepts, and diagnostic assessment." },
        { week: "Week 2", topic: "Techniques & Problem Solving", detail: "Deep dive with guided practice and logic puzzles." },
        { week: "Week 3", topic: "Advanced Applications", detail: "Real-world projects and interactive collaborative work." },
        { week: "Week 4", topic: "Capstone & Showcase", detail: "Comprehensive quiz, project presentation, and certificates." },
      ],
      thumbnail: "",
    };
  });

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding courses...");

  await Course.deleteMany({});
  const courses = generateCourses(40);
  await Course.insertMany(courses);

  console.log(`✅ Seeded ${courses.length} courses successfully.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

