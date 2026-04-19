export default function WelcomeCard({ name }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-bold">
        Welcome back, {name || "User"} 👋
      </h2>
      <p className="text-gray-500">
        Let’s continue your placement preparation
      </p>
    </div>
  );
}