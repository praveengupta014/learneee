import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// @route POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, childName, childGrade } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password, childName, childGrade });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        childName: user.childName,
        childGrade: user.childGrade,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        childName: user.childName,
        childGrade: user.childGrade,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me  (used to "stay logged in" on refresh)
export const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      childName: req.user.childName,
      childGrade: req.user.childGrade,
    },
  });
};

// @route PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, childName, childGrade } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name && name.trim()) user.name = name.trim();
    if (childName !== undefined) user.childName = childName.trim();
    if (childGrade !== undefined) user.childGrade = childGrade.trim();

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        childName: user.childName,
        childGrade: user.childGrade,
      },
    });
  } catch (err) {
    next(err);
  }
};

