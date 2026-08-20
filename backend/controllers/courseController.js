import Course from "../models/Course.js";

// @route GET /api/courses
// Supports: q (text search), subject, grade, minPrice, maxPrice,
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
      filter.$text = { $search: q.trim() };
    }
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (minRating) filter.teacherRating = { $gte: Number(minRating) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
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

    // .lean() skips Mongoose document hydration -- meaningfully faster
    // under high read concurrency since this endpoint is read-heavy.
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
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + courses.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/courses/meta  -> distinct subjects & grades for filter dropdowns
export const getCourseMeta = async (req, res, next) => {
  try {
    const [subjects, grades] = await Promise.all([
      Course.distinct("subject"),
      Course.distinct("grade"),
    ]);
    res.json({ subjects: subjects.sort(), grades: grades.sort() });
  } catch (err) {
    next(err);
  }
};
