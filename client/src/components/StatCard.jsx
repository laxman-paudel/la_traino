export default function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
