export default function ActivitySection({ activity }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="font-semibold mb-3">Recent Activity</h3>

      <ul className="list-disc ml-5 space-y-1">
        {activity?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}