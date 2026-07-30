export default function StatCard({
    title,
    value
}) {
    return (
        <div className="bg-white rounded-xl shadow-md p-5">

            <h3 className="text-gray-500 text-sm">
                {title}
            </h3>

            <h2 className="text-3xl font-bold mt-2">
                {value}
            </h2>

        </div>
    );
}