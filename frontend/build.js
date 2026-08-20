import { existsSync, cpSync, mkdirSync } from "fs";
import { execSync } from "child_process";

console.log("🚀 Starting build in frontend directory...");
console.log("Current working directory:", process.cwd());

if (existsSync("frontend")) {
  execSync("npm --prefix frontend install", { stdio: "inherit" });
  execSync("npm --prefix frontend run build", { stdio: "inherit" });
  if (existsSync("frontend/dist")) {
    if (!existsSync("dist")) mkdirSync("dist", { recursive: true });
    cpSync("frontend/dist", "dist", { recursive: true });
  }
} else {
  execSync("npx vite build", { stdio: "inherit" });
  if (existsSync("dist")) {
    try {
      if (!existsSync("frontend/dist")) mkdirSync("frontend/dist", { recursive: true });
      cpSync("dist", "frontend/dist", { recursive: true });
    } catch (e) {}
  }
}

console.log("🎉 Build complete!");
