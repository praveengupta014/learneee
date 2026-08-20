import Course from "../models/Course.js";
import Booking from "../models/Booking.js";

// Helper to safely escape special characters for regex search
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @route GET /api/courses
// Supports: q (free text search), subject, grade, minPrice, maxPrice,
// minRating, sortBy (price_asc|price_desc|rating_desc|newest), page, limit
export const getCourses = async (req, res, next) => {
  try {
    const {
      q,
      subject,
      grade,
      minPrice,
      maxPrice,
      minRating,
      sortBy = "newest",
      page = 1,
      limit = 9,
    } = req.query;

    const filter = {};

    if (q && q.trim()) {
      const sanitized = escapeRegex(q.trim());
      const searchRegex = new RegExp(sanitized, "i");
      filter.$or = [
        { name: searchRegex },
        { subject: searchRegex },
        { teacher: searchRegex },
        { description: searchRegex },
      ];
    }

    if (subject && subject.trim()) {
      filter.subject = { $regex: new RegExp(`^${escapeRegex(subject.trim())}$`, "i") };
    }

    if (grade && grade.trim()) {
      filter.grade = { $regex: new RegExp(`^${escapeRegex(grade.trim())}$`, "i") };
    }

    if (minRating) {
      const parsedRating = Number(minRating);
      if (!isNaN(parsedRating)) {
        filter.teacherRating = { $gte: parsedRating };
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
      if (Object.keys(filter.price).length === 0) {
        delete filter.price;
      }
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating_desc: { teacherRating: -1 },
      newest: { createdAt: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.newest;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    // .lean() skips Mongoose document hydration for optimal performance
    const [courses, total] = await Promise.all([
      Course.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Course.countDocuments(filter),
    ]);

    res.json({
      courses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasMore: skip + courses.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/courses/meta -> distinct subjects & grades for filter dropdowns
export const getCourseMeta = async (req, res, next) => {
  try {
    const [subjects, grades] = await Promise.all([
      Course.distinct("subject"),
      Course.distinct("grade"),
    ]);

    // Fallback defaults if database is not yet seeded
    const defaultSubjects = ["Mathematics", "Science", "English", "Coding", "Art", "Music"];
    const defaultGrades = ["Grade 1-2", "Grade 3-5", "Grade 6-8", "Grade 9-10", "Grade 11-12"];

    const finalSubjects = subjects.length ? subjects.sort() : defaultSubjects;
    const finalGrades = grades.length ? grades.sort() : defaultGrades;

    res.json({ subjects: finalSubjects, grades: finalGrades });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/courses/:id -> single course details
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/courses/:id/book -> book a course for child
export const bookCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { childName, childGrade, slot, notes } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const bookingChildName = childName?.trim() || req.user.childName || req.user.name;
    const bookingChildGrade = childGrade?.trim() || req.user.childGrade || course.grade;

    if (!bookingChildName) {
      return res.status(400).json({ message: "Child name is required to book a course" });
    }

    // Check if already actively booked for this child
    const existing = await Booking.findOne({
      user: req.user._id,
      course: course._id,
      childName: bookingChildName,
      status: "confirmed",
    });

    if (existing) {
      return res.status(400).json({
        message: `${bookingChildName} is already enrolled in this course.`,
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      course: course._id,
      childName: bookingChildName,
      childGrade: bookingChildGrade,
      parentEmail: req.user.email,
      slot: slot || course.schedule || "Regular Batch",
      notes: notes || "",
      amountPaid: course.price,
      status: "confirmed",
    });

    const populated = await Booking.findById(booking._id).populate("course");

    res.status(201).json({
      message: "Course booked successfully!",
      booking: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/courses/my-bookings -> get all bookings for logged-in user
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("course")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/courses/bookings/:id -> cancel a booking
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, user: req.user._id });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", bookingId: id });
  } catch (err) {
    next(err);
  }
};

// Sample course data generator for on-demand database population
const sampleSubjects = ["Mathematics", "Science", "English", "Coding", "Art", "Music"];
const sampleGrades = ["Grade 1-2", "Grade 3-5", "Grade 6-8", "Grade 9-10", "Grade 11-12"];
const sampleTeachers = [
  "Ms. Priya Sharma", "Mr. Arvind Iyer", "Mrs. Sarah Fernandes", "Mr. Tariq Khan", "Ms. Ananya Rao",
  "Dr. Rajesh Gupta", "Mr. Sourav Das", "Mrs. Maya Nair", "Ms. Neha Verma", "Mr. Rohan Joshi",
];

const courseCatalog = [
  {
    name: "Algebra Foundations & Mental Math",
    subject: "Mathematics",
    grade: "Grade 3-5",
    teacher: "Ms. Priya Sharma",
    teacherRating: 4.9,
    price: 1999,
    duration: "4 Weeks (8 Live Classes)",
    schedule: "Tue & Thu, 5:00 PM - 6:00 PM IST",
    description: "Master variables, equations, and mental arithmetic tricks designed to build confidence in young problem solvers.",
    highlights: ["Interactive equation puzzles", "Speed calculation methods", "Weekly concept worksheets", "Small batch of 6 students"],
    syllabus: [
      { week: "Week 1", topic: "Visual Number Patterns", detail: "Discovering secret sequences and mental addition shortcuts." },
      { week: "Week 2", topic: "The Mystery of X", detail: "Introduction to variables using balance scales and logic games." },
      { week: "Week 3", topic: "Two-Step Equations", detail: "Solving practical real-world word problems step-by-step." },
      { week: "Week 4", topic: "Math Olympiad Challenge", detail: "Fun competitive team quiz and award certificates." },
    ],
  },
  {
    name: "Python Coding Adventures for Kids",
    subject: "Coding",
    grade: "Grade 6-8",
    teacher: "Dr. Rajesh Gupta",
    teacherRating: 4.8,
    price: 3499,
    duration: "6 Weeks (12 Live Classes)",
    schedule: "Mon & Wed, 6:00 PM - 7:00 PM IST",
    description: "Build playable arcade games, turtle graphics art, and simple chatbot assistants using real Python code.",
    highlights: ["Hands-on project in every class", "No prior coding experience needed", "Build 4 portfolio games", "1-on-1 code reviews"],
    syllabus: [
      { week: "Week 1", topic: "Python Basics & Turtle Art", detail: "Drawing geometric masterpieces with code." },
      { week: "Week 2", topic: "Variables, Input & Math", detail: "Creating a superhero quiz and interactive story generator." },
      { week: "Week 3", topic: "Conditionals & Loops", detail: "Building a guessing game with high scores." },
      { week: "Week 4-6", topic: "Capstone Game: Space Invader", detail: "Complete 2D arcade game with graphics and sound." },
    ],
  },
  {
    name: "Physics in Everyday Life & Experiments",
    subject: "Science",
    grade: "Grade 6-8",
    teacher: "Mrs. Sarah Fernandes",
    teacherRating: 4.7,
    price: 2499,
    duration: "4 Weeks (8 Live Classes)",
    schedule: "Sat & Sun, 10:00 AM - 11:00 AM IST",
    description: "Understand gravity, electricity, magnetism, and light through exciting kitchen and household experiments.",
    highlights: ["Live virtual lab demonstrations", "DIY experiment kit list provided", "Science fair project prep", "Quiz at end of every topic"],
    syllabus: [
      { week: "Week 1", topic: "Forces & Motion", detail: "Newton's laws with balloon rockets and friction ramps." },
      { week: "Week 2", topic: "Electricity & Simple Circuits", detail: "How lemon batteries and LED lights work." },
      { week: "Week 3", topic: "Light & Optics", detail: "Bending light, rainbow prisms, and periscope making." },
      { week: "Week 4", topic: "The Physics of Flight", detail: "Aerodynamics, paper airplanes, and drone basics." },
    ],
  },
  {
    name: "Creative Writing & Story Crafting",
    subject: "English",
    grade: "Grade 3-5",
    teacher: "Ms. Neha Verma",
    teacherRating: 4.9,
    price: 1799,
    duration: "4 Weeks (8 Live Classes)",
    schedule: "Fri & Sat, 4:00 PM - 5:00 PM IST",
    description: "Unleash your child's imagination! Learn story arches, captivating character design, dialogue writing, and descriptive vocab.",
    highlights: ["Write a publishable short story", "Vocabulary flashcards & word games", "Story illustrations session", "Parent reading showcase"],
    syllabus: [
      { week: "Week 1", topic: "World Building & Settings", detail: "Creating magical kingdoms and futuristic cities with sensory words." },
      { week: "Week 2", topic: "Heroes, Villains & Sidekicks", detail: "Designing memorable characters with quirks and goals." },
      { week: "Week 3", topic: "The Plot Rollercoaster", detail: "Building suspense, cliffhangers, and satisfactory climaxes." },
      { week: "Week 4", topic: "Polishing & Author Showcase", detail: "Editing drafts and narrating stories in class." },
    ],
  },
  {
    name: "Watercolor Painting & Sketching",
    subject: "Art",
    grade: "Grade 1-2",
    teacher: "Mr. Sourav Das",
    teacherRating: 4.6,
    price: 1499,
    duration: "4 Weeks (8 Live Classes)",
    schedule: "Sat & Sun, 3:00 PM - 4:00 PM IST",
    description: "Joyful exploration of color mixing, brush techniques, gradients, landscape painting, and creative doodling.",
    highlights: ["Step-by-step guided painting", "Encourages creative expression", "Digital gallery of student artwork", "Gentle constructive feedback"],
    syllabus: [
      { week: "Week 1", topic: "Color Wheel Magic", detail: "Mixing primary colors to create rainbow shades." },
      { week: "Week 2", topic: "Wet-on-Wet Sky & Oceans", detail: "Blending watercolors for sunsets and seascapes." },
      { week: "Week 3", topic: "Cute Animals & Nature", detail: "Painting flora, fauna, and cute cartoon characters." },
      { week: "Week 4", topic: "Framed Masterpiece", detail: "Creating a complete landscape on watercolor paper." },
    ],
  },
  {
    name: "Keyboard & Piano Fundamentals",
    subject: "Music",
    grade: "Grade 3-5",
    teacher: "Mr. Rohan Joshi",
    teacherRating: 4.8,
    price: 2899,
    duration: "6 Weeks (12 Live Classes)",
    schedule: "Wed & Sat, 6:00 PM - 7:00 PM IST",
    description: "Learn keyboard posture, reading sheet music notes, basic scales, rhythm clapping, and play famous melodies.",
    highlights: ["Sheet music reading from day 1", "Play 5 popular nursery & classical tunes", "Rhythm and ear training games", "Live performance in final class"],
    syllabus: [
      { week: "Week 1", topic: "Meet the Keyboard", detail: "White & black keys, finger numbering, and Middle C." },
      { week: "Week 2", topic: "Reading Treble Clef Notes", detail: "Notes C-D-E-F-G and simple two-hand melodies." },
      { week: "Week 3", topic: "Rhythm & Tempo", detail: "Quarter notes, half notes, and clapping exercises." },
      { week: "Week 4-6", topic: "Playing Full Songs", detail: "Ode to Joy, Twinkle Twinkle, and final recital." },
    ],
  },
  {
    name: "Robotics & Scratch Block Coding",
    subject: "Coding",
    grade: "Grade 1-2",
    teacher: "Dr. Rajesh Gupta",
    teacherRating: 4.9,
    price: 2199,
    duration: "4 Weeks (8 Live Classes)",
    schedule: "Mon & Thu, 4:30 PM - 5:30 PM IST",
    description: "An intuitive introduction to logical thinking and animations using Scratch block-based drag-and-drop programming.",
    highlights: ["Visual coding with animations", "Create interactive cartoons", "Develop problem-solving mindset", "Certificate of completion"],
    syllabus: [
      { week: "Week 1", topic: "Sprite Movement & Costumes", detail: "Making characters walk, talk, and dance." },
      { week: "Week 2", topic: "Sound & Music Blocks", detail: "Composing musical instruments in Scratch." },
      { week: "Week 3", topic: "Catch the Falling Star Game", detail: "Using score variables and keyboard controls." },
      { week: "Week 4", topic: "Maze Runner Adventure", detail: "Obstacle detection, win screen, and showcase." },
    ],
  },
  {
    name: "Astronomy & Space Exploration",
    subject: "Science",
    grade: "Grade 9-10",
    teacher: "Mrs. Maya Nair",
    teacherRating: 4.8,
    price: 2999,
    duration: "4 Weeks (8 Live Classes)",
    schedule: "Fri & Sun, 7:00 PM - 8:00 PM IST",
    description: "Explore the mysteries of the solar system, black holes, exoplanets, Mars rovers, and the latest telescope discoveries.",
    highlights: ["3D telescope simulation software", "NASA & ISRO mission case studies", "Interactive stargazing maps", "Guest astronomy speaker session"],
    syllabus: [
      { week: "Week 1", topic: "Our Solar System & Moons", detail: "Gas giants, rocky planets, and icy moons." },
      { week: "Week 2", topic: "Life & Death of Stars", detail: "Nebulae, supernovas, neutron stars, and black holes." },
      { week: "Week 3", topic: "Rockets & Space Travel", detail: "Orbital mechanics, Chandrayaan, Artemis, and Mars." },
      { week: "Week 4", topic: "Exoplanets & The Multiverse", detail: "James Webb Telescope discoveries and alien worlds." },
    ],
  },
  {
    name: "Public Speaking & Debate Championship",
    subject: "English",
    grade: "Grade 9-10",
    teacher: "Mr. Tariq Khan",
    teacherRating: 4.9,
    price: 2799,
    duration: "5 Weeks (10 Live Classes)",
    schedule: "Tue & Fri, 6:30 PM - 7:30 PM IST",
    description: "Overcome stage fear, master voice modulation, structure persuasive arguments, and excel in debates and presentations.",
    highlights: ["Live mini-debates every week", "Body language & eye contact drills", "Extempore speaking practice", "Model UN (MUN) style resolution"],
    syllabus: [
      { week: "Week 1", topic: "Conquering Stage Fright", detail: "Breathing techniques, opening hooks, and vocal projection." },
      { week: "Week 2", topic: "Structuring Persuasive Speeches", detail: "The PREP formula (Point, Reason, Example, Point)." },
      { week: "Week 3", topic: "The Art of Rebuttal", detail: "Listening critically and crafting quick counter-arguments." },
      { week: "Week 4-5", topic: "Grand Debate Tournament", detail: "Live debate tournament with judges and peer reviews." },
    ],
  },
  {
    name: "Vedic Math Speed Arithmetic",
    subject: "Mathematics",
    grade: "Grade 6-8",
    teacher: "Mr. Arvind Iyer",
    teacherRating: 4.7,
    price: 1899,
    duration: "4 Weeks (8 Live Classes)",
    schedule: "Mon & Wed, 5:00 PM - 6:00 PM IST",
    description: "Learn ancient Indian mental math sutras to multiply 3-digit numbers in 5 seconds and calculate square roots instantly.",
    highlights: ["Multiply huge numbers mentally", "Speed check techniques", "Olympiad and exam booster", "Daily 10-minute speed drills"],
    syllabus: [
      { week: "Week 1", topic: "Cross-Multiplication Mastery", detail: "Urdhva Tiryagbhyam sutra for 2x2 and 3x3 numbers." },
      { week: "Week 2", topic: "Base Multiplication (10, 100, 1000)", detail: "Nikhilam sutra for lightning-fast calculations." },
      { week: "Week 3", topic: "Instant Squares & Cubes", detail: "Calculating squares ending in 5 and near bases." },
      { week: "Week 4", topic: "Division Shortcuts & Speed Test", detail: "Fast division methods and final speed assessment." },
    ],
  },
  {
    name: "High School Calculus & Coordinate Geometry",
    subject: "Mathematics",
    grade: "Grade 11-12",
    teacher: "Ms. Ananya Rao",
    teacherRating: 4.9,
    price: 3999,
    duration: "6 Weeks (12 Live Classes)",
    schedule: "Tue & Sat, 7:00 PM - 8:30 PM IST",
    description: "Deep dive into limits, derivatives, integration, and conic sections tailored for board exams and competitive entrance tests.",
    highlights: ["In-depth conceptual proofs", "150+ solved exam-level problems", "Formula cheat sheets provided", "Weekly mock assessments"],
    syllabus: [
      { week: "Week 1", topic: "Limits & Continuity", detail: "Epsilon-delta intuition, standard limits, and L'Hopital rule." },
      { week: "Week 2", topic: "Differentiation & Applications", detail: "Chain rule, tangents, normals, maxima and minima." },
      { week: "Week 3-4", topic: "Indefinite & Definite Integrals", detail: "Substitution, parts, partial fractions, and area under curve." },
      { week: "Week 5-6", topic: "Conic Sections & Vectors", detail: "Parabola, ellipse, hyperbola, and 3D geometry." },
    ],
  },
  {
    name: "Web Development Bootcamp: HTML, CSS & JS",
    subject: "Coding",
    grade: "Grade 11-12",
    teacher: "Dr. Rajesh Gupta",
    teacherRating: 4.9,
    price: 4499,
    duration: "8 Weeks (16 Live Classes)",
    schedule: "Wed & Sun, 6:00 PM - 7:30 PM IST",
    description: "Build modern, responsive websites and interactive web apps from scratch and deploy them live to the web.",
    highlights: ["Deploy real websites on Vercel/Netlify", "Learn responsive design with CSS Flex/Grid", "DOM manipulation & APIs in JavaScript", "Build 3 portfolio web apps"],
    syllabus: [
      { week: "Week 1-2", topic: "HTML5 & Modern CSS", detail: "Semantic markup, Flexbox, Grid, and responsive mobile layouts." },
      { week: "Week 3-4", topic: "JavaScript Core Fundamentals", detail: "Variables, functions, arrays, objects, and ES6+ features." },
      { week: "Week 5-6", topic: "DOM & Interactive Web Apps", detail: "Building a live Weather App using Fetch API." },
      { week: "Week 7-8", topic: "Full Portfolio Project & Deployment", detail: "Building a personal portfolio and deploying live." },
    ],
  },
];

// @route POST /api/courses/seed -> seed database on demand (e.g. on new deployment)
export const seedCourses = async (req, res, next) => {
  try {
    const existingCount = await Course.countDocuments();
    if (existingCount > 0 && req.query.force !== "true") {
      return res.json({
        message: `Database already contains ${existingCount} courses. Use ?force=true to re-seed.`,
        count: existingCount,
      });
    }

    if (req.query.force === "true") {
      await Course.deleteMany({});
    }

    const inserted = await Course.insertMany(courseCatalog);
    res.status(201).json({
      message: `Successfully seeded ${inserted.length} courses.`,
      courses: inserted,
    });
  } catch (err) {
    next(err);
  }
};

