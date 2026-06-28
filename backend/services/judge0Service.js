import axios from "axios";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";

// ⚠️ Put your API key in .env
const headers = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
};

export const executeCode = async (code, language_id, input) => {
  try {
    // STEP 1: Submit code
    const submission = await axios.post(
      `${JUDGE0_URL}/submissions`,
      {
        source_code: code,
        language_id,
        stdin: input,
      },
      { headers }
    );

    const token = submission.data.token;

    // STEP 2: Wait for result
    let result;
    while (true) {
      const res = await axios.get(
        `${JUDGE0_URL}/submissions/${token}`,
        { headers }
      );

      result = res.data;

      if (result.status.id >= 3) break; // finished
      await new Promise((r) => setTimeout(r, 1000));
    }

    return result;
  } catch (err) {
    throw err;
  }
};