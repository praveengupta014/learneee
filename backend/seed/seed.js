// Seeds the local MongoDB with sample courses for development.
// Run with: npm run seed  (from backend/, after setting MONGO_URI in .env)
import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "../models/Course.js";

dotenv.config();

const subjects = ["Mathematics", "Science", "English", "Coding", "Art", "Music"];
const grades = ["Grade 1-2", "Grade 3-5", "Grade 6-8", "Grade 9-10", "Grade 11-12"];
const teachers = [
  "Ms. Sharma", "Mr. Iyer", "Mrs. Fernandes", "Mr. Khan", "Ms. Rao",
  "Dr. Gupta", "Mr. Das", "Mrs. Nair", "Ms. Verma", "Mr. Joshi",
];

const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randNum = (min, max, decimals = 0) =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));

const courseNamesBySubject = {
  Mathematics: ["Algebra Foundations", "Geometry Essentials", "Vedic Math Speed Tricks", "Calculus Basics"],
  Science: ["Physics in Everyday Life", "Chemistry Lab Skills", "Human Biology 101", "Astronomy for Kids"],
  English: ["Creative Writing Workshop", "Grammar Mastery", "Public Speaking", "Reading Comprehension"],
  Coding: ["Scratch for Beginners", "Python Fundamentals", "Web Dev Basics", "Intro to Robotics"],
  Art: ["Watercolor Painting", "Sketching Fundamentals", "Digital Art Basics", "Craft & Collage"],
  Music: ["Piano for Beginners", "Guitar Basics", "Vocal Training", "Music Theory 101"],
};

const generateCourses = (count) =>
  Array.from({ length: count }, () => {
    const subject = randOf(subjects);
    return {
      name: randOf(courseNamesBySubject[subject]),
      subject,
      grade: randOf(grades),
      teacher: randOf(teachers),
      teacherRating: randNum(3, 5, 1),
      price: randNum(499, 4999),
      description: `A hands-on ${subject.toLowerCase()} course designed to build strong fundamentals through interactive weekly sessions.`,
      thumbnail: "",
    };
  });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding courses...");

  await Course.deleteMany({});
  const courses = generateCourses(60);
  await Course.insertMany(courses);

  console.log(`Seeded ${courses.length} courses.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
