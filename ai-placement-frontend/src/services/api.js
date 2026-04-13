const BASE_URL = "http://localhost:5000/api";

export const fetchQuestions = async (type, company = "") => {
  const url = company
    ? `${BASE_URL}/questions?type=${type}&company=${company}`
    : `${BASE_URL}/questions?type=${type}`;

  const res = await fetch(url);
  return res.json();
};

export const analyzeResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${BASE_URL}/resume/analyze`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};