import { existsSync, cpSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import path from "path";

console.log("🚀 Starting build process...");
console.log("Current working directory:", process.cwd());

if (existsSync("frontend")) {
  console.log("📁 Detected root directory. Building frontend subdirectory...");
  execSync("npm --prefix frontend install", { stdio: "inherit" });
  execSync("npm --prefix frontend run build", { stdio: "inherit" });

  // Ensure frontend/dist exists and copy to dist at root if needed
  if (existsSync("frontend/dist")) {
    console.log("✅ frontend/dist built successfully.");
    try {
      if (!existsSync("dist")) mkdirSync("dist", { recursive: true });
      cpSync("frontend/dist", "dist", { recursive: true });
      console.log("✅ Mirrored frontend/dist to root dist/ for universal compatibility.");
    } catch (e) {
      console.warn("Notice: dist mirror skipped", e.message);
    }
  }
} else {
  console.log("📁 Detected frontend directory. Building directly with vite...");
  execSync("npx vite build", { stdio: "inherit" });
}

console.log("🎉 Build complete!");
