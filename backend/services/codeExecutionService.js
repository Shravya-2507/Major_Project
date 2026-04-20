import { exec } from "child_process";
import fs from "fs";

export const executeCode = (language, code, input) => {
  return new Promise((resolve) => {
    const file = language === "python" ? "temp.py" : "temp.js";

    fs.writeFileSync(file, code);
    fs.writeFileSync("input.txt", input);

    const cmd =
      language === "python"
        ? `python ${file} < input.txt`
        : `node ${file} < input.txt`;

    const process = exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        return resolve({
          output: stderr || "Execution Error / Time Limit Exceeded",
        });
      }

      resolve({ output: stdout });
    });

    // extra safety
    process.on("error", () => {
      resolve({ output: "Execution crashed" });
    });
  });
};