import fs from "fs";

// PDF parsing disabled due to ESM compatibility issues
// If you need PDF parsing, install: npm install pdf-parse@1.1.1

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // For now, return placeholder since pdf-parse has ESM issues
    res.json({
      text: "PDF parsing temporarily disabled - file received successfully",
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File processing failed" });
  }
};

// Alias for route compatibility
export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Mock resume analysis response
    res.json({
      success: true,
      filename: req.file.originalname,
      analysis: {
        skills: ["JavaScript", "React", "Node.js"],
        experience: "Unable to parse - PDF support disabled",
        suggestions: [
          "Add more specific technical skills",
          "Include quantifiable achievements",
          "Ensure contact information is complete"
        ]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Resume analysis failed" });
  }
};