import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../config/api";

export default function CandidateProfile() {
  const { id } = useParams();

  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    loadCandidate();
  }, []);

  const loadCandidate = async () => {
    try {
      const res = await api.get(`/admin/candidate/${id}`);
      setCandidate(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!candidate)
    return <h2 className="text-xl font-semibold">Loading...</h2>;

  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-bold">
        Candidate Profile
      </h1>

      <div className="bg-white rounded-xl shadow p-8">

        <div className="grid grid-cols-2 gap-6">

          <div>
            <p className="text-gray-500">Name</p>
            <h2 className="text-2xl font-semibold">
              {candidate.name}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">Email</p>
            <h2 className="text-lg">
              {candidate.email}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">Average Score</p>
            <h2 className="text-2xl font-bold text-green-600">
              {candidate.average_score}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">Highest Score</p>
            <h2 className="text-2xl font-bold text-blue-600">
              {candidate.highest_score}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">Tests Attempted</p>
            <h2 className="text-2xl">
              {candidate.tests_attempted}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">Current Rank</p>
            <h2 className="text-2xl font-bold text-red-600">
              #{candidate.rank}
            </h2>
          </div>

        </div>

      </div>

    </div>
  );
}