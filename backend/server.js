import app from "./app.js";

const PORT = process.env.PORT || 5000;

// Start HTTP server for local development or non-serverless hosting
if (process.env.NODE_ENV !== "production" || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) {
  app.listen(PORT, () => {
    console.log(`🚀 Learniee API server running on port ${PORT}`);
  });
}

// Export default app for Vercel Serverless Functions
export default app;