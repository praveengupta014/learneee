import { existsSync, cpSync, mkdirSync } from "fs";
import { execSync } from "child_process";

console.log("🚀 Starting universal build process...");
console.log("Current working directory:", process.cwd());

if (existsSync("frontend")) {
  console.log("📁 Detected root directory. Building frontend subdirectory...");
  execSync("npm --prefix frontend install", { stdio: "inherit" });
  execSync("npm --prefix frontend run build", { stdio: "inherit" });

  if (existsSync("frontend/dist")) {
    console.log("✅ frontend/dist exists.");
    try {
      if (!existsSync("dist")) mkdirSync("dist", { recursive: true });
      cpSync("frontend/dist", "dist", { recursive: true });
      console.log("✅ Copied to root dist/ directory.");
    } catch (err) {
      console.error("Copy error:", err);
    }
  }
} else {
  console.log("📁 Detected frontend directory. Building with vite...");
  execSync("npx vite build", { stdio: "inherit" });

  if (existsSync("dist")) {
    try {
      if (!existsSync("frontend/dist")) mkdirSync("frontend/dist", { recursive: true });
      cpSync("dist", "frontend/dist", { recursive: true });
    } catch (err) {
      // ignore
    }
  }
}

console.log("🎉 Build complete!");
