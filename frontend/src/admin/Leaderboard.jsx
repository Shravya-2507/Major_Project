import { useEffect, useState } from "react";
import api from "../services/api";

export default function Leaderboard() {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadLeaderboard();
  }, []);



  async function loadLeaderboard() {

    try {

      const res = await api.get("/admin/leaderboard/overall");

      setRows(res.data.data || []);

    } catch (error) {

      console.error("Leaderboard Error:", error);

    } finally {

      setLoading(false);

    }

  }



  const getRankStyle = (rank) => {

    if (rank === 1)
      return "bg-yellow-100 text-yellow-700 font-bold";

    if (rank === 2)
      return "bg-gray-100 text-gray-700 font-bold";

    if (rank === 3)
      return "bg-orange-100 text-orange-700 font-bold";

    return "";

  };



  return (

    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">


      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        🏆 Overall Leaderboard
      </h1>



      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6">


        {loading ? (

          <p className="text-center text-gray-500">
            Loading leaderboard...
          </p>

        ) : rows.length === 0 ? (

          <p className="text-center text-gray-500">
            No leaderboard data available
          </p>

        ) : (

          <div className="overflow-x-auto">


            <table className="w-full border-collapse">


              <thead>

                <tr className="border-b bg-purple-100">

                  <th className="p-4 text-left">
                    Rank
                  </th>

                  <th className="p-4 text-left">
                    Candidate
                  </th>

                  <th className="p-4 text-left">
                    Average Score
                  </th>

                  <th className="p-4 text-left">
                    Highest Score
                  </th>

                  <th className="p-4 text-left">
                    Tests Attempted
                  </th>

                </tr>

              </thead>



              <tbody>


                {rows.map((r) => (

                  <tr
                    key={r.id}
                    className="border-b hover:bg-purple-50 transition"
                  >


                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full ${getRankStyle(
                          r.overall_rank
                        )}`}
                      >

                        #{r.overall_rank}

                      </span>

                    </td>



                    <td className="p-4 font-semibold">

                      {r.name}

                    </td>



                    <td className="p-4 text-purple-700 font-bold">

                      {r.average_score}

                    </td>



                    <td className="p-4 text-green-600 font-semibold">

                      {r.highest_score}

                    </td>



                    <td className="p-4">

                      {r.tests_attempted}

                    </td>


                  </tr>

                ))}


              </tbody>


            </table>


          </div>

        )}


      </div>


    </main>

  );

}