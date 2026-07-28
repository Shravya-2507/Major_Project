import { exec } from "child_process";
import fs from "fs";

export const runCode = async (req, res) => {
  const { code, input = "" } = req.body;

  const filePath = "./tempCode.js";

  try {
    // Write code to file
    fs.writeFileSync(filePath, code);

    // Run the node process, piping the input via stdin if provided
    const child = exec(`node ${filePath}`, (error, stdout, stderr) => {
      // Clean up temporary file asynchronously
      fs.unlink(filePath, () => {});

      if (error) {
        return res.json({ error: error.message });
      }

      if (stderr) {
        return res.json({ error: stderr });
      }

      res.json({ output: stdout });
    });

    // If input is provided, write it to the process's standard input
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: err.message });
  }
};