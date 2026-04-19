import { exec } from "child_process";
import fs from "fs";

export const runCode = async (req, res) => {
  const { code } = req.body;

  const filePath = "./tempCode.js";

  try {
    // write code to file
    fs.writeFileSync(filePath, code);

    exec(`node ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        return res.json({ error: error.message });
      }

      if (stderr) {
        return res.json({ error: stderr });
      }

      res.json({ output: stdout });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};