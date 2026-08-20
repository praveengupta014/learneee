import { existsSync } from "fs";
import { execSync } from "child_process";

console.log("🚀 Starting build process...");
console.log("Current working directory:", process.cwd());

if (existsSync("frontend")) {
  console.log("📁 Detected root directory. Building frontend subdirectory...");
  execSync("npm --prefix frontend install", { stdio: "inherit" });
  execSync("npm --prefix frontend run build", { stdio: "inherit" });
} else {
  console.log("📁 Detected frontend directory. Building directly with vite...");
  execSync("npx vite build", { stdio: "inherit" });
}

console.log("🎉 Build complete!");
