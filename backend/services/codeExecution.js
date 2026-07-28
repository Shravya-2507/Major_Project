import { exec } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const executeCode = (language, code, input = "") => {
  return new Promise((resolve) => {
    // Generate a unique identifier to prevent concurrent requests from overriding each other's files
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const ext = language === "python" ? "py" : "js";
    
    const file = path.join(process.cwd(), `temp_${uniqueId}.${ext}`);
    const inputFile = path.join(process.cwd(), `input_${uniqueId}.txt`);

    try {
      fs.writeFileSync(file, code);
      fs.writeFileSync(inputFile, input);
    } catch (err) {
      return resolve({
        output: "",
        stderr: "Failed to write temporary execution files",
        code: 1,
      });
    }

    const pyCmd = process.platform === "win32" ? "python" : "python3";
    const cmd =
      language === "python"
        ? `${pyCmd} "${file}" < "${inputFile}"`
        : `node "${file}" < "${inputFile}"`;

    const childProcess = exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
      // Cleanup temporary files
      cleanupFiles([file, inputFile]);

      if (error) {
        return resolve({
          output: stdout || "",
          stderr: stderr || error.message || "Execution Error / Time Limit Exceeded",
          status: "WA", // Wrong Answer or Error status tracker
        });
      }

      resolve({
        output: stdout || "",
        stderr: stderr || "",
        status: "AC", // Accepted status tracker
      });
    });

    childProcess.on("error", (err) => {
      cleanupFiles([file, inputFile]);
      resolve({
        output: "",
        stderr: err.message || "Execution crashed",
        status: "RE", // Runtime Error
      });
    });
  });
};

// Helper function to safely delete temporary files
const cleanupFiles = (files) => {
  files.forEach((filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      // Ignore cleanup file lock errors
    }
  });
};