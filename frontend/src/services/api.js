import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// =========================================
// AXIOS INSTANCE
// =========================================

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================
// REQUEST INTERCEPTOR
// =========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================
// RESPONSE INTERCEPTOR
// =========================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API ERROR:",
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;

// =========================================
// HELPER FOR FETCH CALLS
// =========================================

const handleResponse = async (res) => {
  let data = {};

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    /*
     * IMPORTANT:
     * Preserve the complete backend error.
     *
     * Previously this only returned:
     *
     *   error.error
     *
     * which hid:
     *
     *   details
     *   code
     *   database_detail
     */

    const message =
      data?.details ||
      data?.error ||
      data?.message ||
      `Request failed with status ${res.status}`;

    const error = new Error(message);

    error.status = res.status;
    error.response = {
      status: res.status,
      data,
    };

    throw error;
  }

  return data;
};

// =========================================
// AUTH
// =========================================

export const signupUser = async (userData) => {
  const res = await fetch(
    `${BASE_URL}/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  return await handleResponse(res);
};

export const loginUser = async (credentials) => {
  const res = await fetch(
    `${BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  return await handleResponse(res);
};

export const loginAdmin = async (credentials) => {
  const res = await fetch(
    `${BASE_URL}/auth/admin/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  return await handleResponse(res);
};

export const signupAdmin = async (adminData) => {
  const res = await fetch(
    `${BASE_URL}/auth/admin/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminData),
    }
  );

  return await handleResponse(res);
};

// =========================================
// COMPANIES
// =========================================

export const fetchCompanies = async () => {
  try {
    const res = await fetch(
      `${BASE_URL}/companies`
    );

    return await handleResponse(res);
  } catch (err) {
    console.error(
      "Fetch Companies Error:",
      err.message
    );

    throw err;
  }
};

// =========================================
// ROLES
// =========================================

export const fetchRoles = async (companyId) => {
  try {
    const url =
      !companyId ||
      companyId === "general"
        ? `${BASE_URL}/roles`
        : `${BASE_URL}/companies/${companyId}/roles`;

    const res = await fetch(url);

    return await handleResponse(res);
  } catch (err) {
    console.error(
      "Fetch Roles Error:",
      err.message
    );

    return [];
  }
};

// =========================================
// INTERVIEW
// =========================================

/**
 * Generate first interview question.
 *
 * Backend:
 * POST /api/interview/questions
 */
export const fetchQuestions = async (data = {}) => {
  try {
    const payload = {
      candidateId:
        data.candidateId ?? null,

      roleId:
        data.roleId ?? null,

      companyId:
        data.companyId ?? null,

      topic:
        data.topic || "General",

      question_type:
        data.question_type ||
        "Technical",

      category:
        data.category ||
        "Conceptual",

      totalQuestions:
        Number(data.totalQuestions) || 5,
    };

    console.log(
      "========== FETCHING FIRST INTERVIEW QUESTION =========="
    );

    console.log(payload);

    const res = await fetch(
      `${BASE_URL}/interview/questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result =
      await handleResponse(res);

    console.log(
      "========== FIRST QUESTION RESPONSE =========="
    );

    console.dir(
      result,
      { depth: null }
    );

    console.log(
      "=============================================="
    );

    return result;

  } catch (err) {
    console.error(
      "========== FETCH QUESTIONS ERROR =========="
    );

    console.error(
      "Message:",
      err.message
    );

    console.error(
      "Status:",
      err.status
    );

    console.error(
      "Response:",
      err.response?.data
    );

    console.error(
      "==========================================="
    );

    throw err;
  }
};

/**
 * Generate adaptive next question.
 *
 * Backend:
 * POST /api/interview/next-question
 */
export const getNextQuestion = async (
  data = {}
) => {
  try {
    console.log(
      "========== FETCHING NEXT INTERVIEW QUESTION =========="
    );

    console.dir(
      data,
      { depth: null }
    );

    const res = await fetch(
      `${BASE_URL}/interview/next-question`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result =
      await handleResponse(res);

    console.log(
      "========== NEXT QUESTION RESPONSE =========="
    );

    console.dir(
      result,
      { depth: null }
    );

    console.log(
      "============================================="
    );

    return result;

  } catch (err) {
    console.error(
      "Get Next Question Error:",
      err.message
    );

    console.error(
      "Status:",
      err.status
    );

    console.error(
      "Response:",
      err.response?.data
    );

    throw err;
  }
};


// =========================================
// EVALUATE ONE ANSWER
// =========================================

export const evaluateAnswer = async (
  question,
  studentAnswer,
  role = "General",
  company = "General"
) => {
  const payload = {
    question: String(question || "").trim(),
    student_answer: String(studentAnswer || "").trim(),
    role: String(role || "General").trim(),
    company: String(company || "General").trim(),
  };

  console.log("========== POST /evaluate ==========");
  console.log(payload);

  const res = await fetch(
    `${BASE_URL}/evaluate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return await handleResponse(res);
};


// =========================================
// FINAL INTERVIEW EVALUATION
// =========================================

export const evaluateInterview = async ({
  role = "General",
  company = "General",
  answers = [],
}) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error("No evaluated answers provided.");
  }

  const payload = {
    role,
    company,
    answers,
  };

  console.log(
    "========== POST /evaluate-interview =========="
  );

  console.dir(payload, { depth: null });

  const res = await fetch(
    `${BASE_URL}/evaluate-interview`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await handleResponse(res);

  console.log(
    "========== FINAL INTERVIEW REPORT =========="
  );

  console.dir(result, { depth: null });

  return result;
};


// =========================================
// BACKWARD COMPATIBILITY
// =========================================

export const evaluateInterviewAnswer = async (data) => {
  return evaluateAnswer(
    data.question,
    data.student_answer,
    data.role,
    data.company
  );
};

export const evaluateCompleteInterview = async (data) => {
  return evaluateInterview(data);
};



/**
 * Submit / evaluate complete interview.
 *
 * IMPORTANT:
 * The backend evaluateInterview() expects:
 *
 * candidateId
 * sessionId
 * companyId
 * roleId
 * currentQuestionId
 * currentAnswer
 * testType
 * startedAt
 * answers
 */
export const submitAnswers = async (
  data = {}
) => {
  try {
    const payload = {
      candidateId:
        data.candidateId ?? null,

      sessionId:
        data.sessionId ?? null,

      roleId:
        data.roleId ?? null,

      companyId:
        data.companyId ?? null,

      currentQuestionId:
        data.currentQuestionId ?? null,

      currentAnswer:
        data.currentAnswer ?? "",

      testType:
        data.testType || "interview",

      startedAt:
        data.startedAt ?? null,

      answers:
        Array.isArray(data.answers)
          ? data.answers
          : [],
    };

    console.log(
      "========== SUBMITTING INTERVIEW =========="
    );

    console.dir(
      payload,
      { depth: null }
    );

    console.log(
      "==========================================="
    );

    const res = await fetch(
      `${BASE_URL}/interview/evaluate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result =
      await handleResponse(res);

    console.log(
      "========== INTERVIEW SUBMIT RESPONSE =========="
    );

    console.dir(
      result,
      { depth: null }
    );

    console.log(
      "==============================================="
    );

    return result;

  } catch (err) {
    console.error(
      "Submit Answers Error:",
      err.message
    );

    console.error(
      "Status:",
      err.status
    );

    console.error(
      "Response:",
      err.response?.data
    );

    throw err;
  }
};

// =========================================
// GET INTERVIEW REPORT
// =========================================

// =========================================
// GET INTERVIEW REPORT
// =========================================

export const getReport = async (
  candidateId,
  sessionId
) => {
  try {
    if (!candidateId) {
      throw new Error("Candidate ID is required.");
    }

    let url =
      `${BASE_URL}/interview/analyze/${candidateId}`;

    if (sessionId) {
      url += `?sessionId=${encodeURIComponent(sessionId)}`;
    }

    console.log("========== GETTING INTERVIEW REPORT ==========");
    console.log({
      candidateId,
      sessionId,
      url,
    });

    const res = await fetch(url);

    const data = await handleResponse(res);

    console.log("========== INTERVIEW REPORT RESPONSE ==========");
    console.dir(data, { depth: null });

    // Backend returns:
    // {
    //   success: true,
    //   candidateId,
    //   sessionId,
    //   report: {...}
    // }

    if (!data || data.success === false) {
      throw new Error(
        data?.details ||
        data?.error ||
        "Failed to load interview report."
      );
    }

    // Return the actual report object to Feedback.jsx
    return {
      ...data.report,

      success: data.report?.success ?? data.success,

      candidateId:
        data.candidateId || candidateId,

      sessionId:
        data.sessionId || sessionId || "",

      role:
        data.report?.role || "General",

      company:
        data.report?.company || "General",
    };

  } catch (err) {
    console.error(
      "Get Report Error:",
      err.message
    );

    throw err;
  }
};

// =========================================
// VTU QUESTIONS
// =========================================

export const fetchVtuQuestions = async () => {
  try {
    const res = await fetch(
      `${BASE_URL}/vtu-questions`
    );

    return await handleResponse(res);

  } catch (err) {
    console.error(
      "Fetch VTU Questions Error:",
      err.message
    );

    throw err;
  }
};

// =========================================
// RESUME ANALYSIS
// =========================================

export const analyzeResume = async (
  file,
  role = ""
) => {
  try {
    const formData =
      new FormData();

    formData.append(
      "resume",
      file
    );

    formData.append(
      "role",
      role
    );

    const res =
      await fetch(
        `${BASE_URL}/resume/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

    return await handleResponse(res);

  } catch (err) {
    console.error(
      "Resume Analysis Error:",
      err.message
    );

    throw err;
  }
};

// =========================================
// ADMIN DASHBOARD APIs
// =========================================

export const fetchAdminDashboard =
  async () => {
    try {
      const response =
        await api.get(
          "/admin/dashboard"
        );

      return response.data;

    } catch (err) {
      console.error(
        "Fetch Admin Dashboard Error:",
        err
      );

      throw err;
    }
  };

export const fetchTopPerformers =
  async () => {
    try {
      const response =
        await api.get(
          "/admin/top-performers"
        );

      return response.data;

    } catch (err) {
      console.error(
        "Fetch Top Performers Error:",
        err
      );

      throw err;
    }
  };

export const fetchActivities =
  async () => {
    try {
      const response =
        await api.get(
          "/admin/activities"
        );

      return response.data;

    } catch (err) {
      console.error(
        "Fetch Activities Error:",
        err
      );

      throw err;
    }
  };

export const fetchBestSubject =
  async () => {
    try {
      const response =
        await api.get(
          "/admin/best-subject"
        );

      return response.data;

    } catch (err) {
      console.error(
        "Fetch Best Subject Error:",
        err
      );

      throw err;
    }
  };

export const fetchWeakestSubject =
  async () => {
    try {
      const response =
        await api.get(
          "/admin/weakest-subject"
        );

      return response.data;

    } catch (err) {
      console.error(
        "Fetch Weakest Subject Error:",
        err
      );

      throw err;
    }
  };

// =========================================
// CODING INTERVIEW API
// =========================================

export const codingAPI = {

  getQuestions: async (
    candidateId = 1
  ) => {
    const cacheKey =
      `active_coding_questions_${candidateId}`;

    const cached =
      localStorage.getItem(
        cacheKey
      );

    if (cached) {
      try {
        return JSON.parse(
          cached
        );
      } catch {
        localStorage.removeItem(
          cacheKey
        );
      }
    }

    const res =
      await fetch(
        `${BASE_URL}/code/next?candidateId=${candidateId}`
      );

    const questions =
      await handleResponse(res);

    localStorage.setItem(
      cacheKey,
      JSON.stringify(
        questions
      )
    );

    return questions;
  },

  clearSession: (
    candidateId = 1
  ) => {
    localStorage.removeItem(
      `active_coding_questions_${candidateId}`
    );

    localStorage.removeItem(
      `candidate_code_drafts_${candidateId}`
    );
  },

  saveCodeDraft: (
    questionId,
    code,
    candidateId = 1
  ) => {
    const draftKey =
      `candidate_code_drafts_${candidateId}`;

    let drafts = {};

    try {
      drafts =
        JSON.parse(
          localStorage.getItem(
            draftKey
          )
        ) || {};

    } catch {
      drafts = {};
    }

    drafts[questionId] =
      code;

    localStorage.setItem(
      draftKey,
      JSON.stringify(
        drafts
      )
    );
  },

  getCodeDraft: (
    questionId,
    candidateId = 1
  ) => {
    const draftKey =
      `candidate_code_drafts_${candidateId}`;

    try {
      const drafts =
        JSON.parse(
          localStorage.getItem(
            draftKey
          )
        ) || {};

      return (
        drafts[questionId] ||
        ""
      );

    } catch {
      return "";
    }
  },

  runCode: async (
    code,
    language,
    input = ""
  ) => {
    const res =
      await fetch(
        `${BASE_URL}/code/run`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            code,
            language,
            language_id:
              language,
            input,
          }),
        }
      );

    return await handleResponse(
      res
    );
  },

  submitCode: async (
    payload
  ) => {
    const response =
      await fetch(
        `${BASE_URL}/code/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

    return await handleResponse(
      response
    );
  },
};

