import { executeCode } from "../services/judgeService.js";

export const runCode = async (req, res) => {
  const { code, language, testCases } = req.body;

  try {
    let results = [];

    for (let tc of testCases) {
      const response = await executeCode(
        code,
        language,
        tc.input
      );

      const output = response.stdout?.trim() || "";
      const error = response.stderr;

      results.push({
        input: tc.input,
        expected: tc.output,
        output,
        error: error || null,
        passed: output === tc.output,
      });
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};