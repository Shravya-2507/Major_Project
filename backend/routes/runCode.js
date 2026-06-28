import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { code, language, input } = req.body;

  try {
    const langMap = {
      javascript: "nodejs",
      python: "python3",
    };

    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language: langMap[language],
        version: "*",
        files: [
          {
            content: code,
          },
        ],
        stdin: input || "",
      }
    );

    const result = response.data;

    res.json({
      output: result.run.output || "",
      stderr: result.run.stderr || "",
      code: result.run.code,
    });

  } catch (err) {
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
});

export default router;