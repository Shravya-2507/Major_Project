import axios from "axios";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

// =====================
// Extract Resume Text
// =====================
export const extractResumeText = async (req, res) => {
  try {
    const file = req.file;

    if (!file?.buffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const data = await pdfParse(file.buffer);

    return res.json({
      text: data.text || "",
    });

  } catch (error) {
    console.error("PDF Parse Error FULL:", error);

    return res.status(500).json({
      error: "Failed to parse PDF",
    });
  }
};

// =====================
// Analyze Resume
// =====================
export const analyzeResume = async (req, res) => {

  try {

    const file = req.file;


    if (!file?.buffer) {

      return res.status(400).json({
        error:"No file uploaded"
      });

    }


    const data = await pdfParse(file.buffer);


    const extractedText = (data.text || "")
      .replace(/\r/g,"")
      .replace(/[ \t]+/g," ")
      .trim();



    if(!extractedText){

      return res.status(400).json({
        error:"Could not extract text from resume"
      });

    }



    const response = await axios.post(

      `${PYTHON_BACKEND_URL}/analyze-resume`,

      {

        text: extractedText,

        role:
          req.body.role || "Software Engineer",

        job_description:
          req.body.job_description || ""

      },

      {
        timeout:60000
      }

    );


    return res.json(response.data);



  } catch(err){


    console.error(
      "Resume Error:",
      err.response?.data || err.message
    );


    return res.status(500).json({

      error:"Resume analysis failed",

      details:
        err.response?.data || err.message

    });

  }

};