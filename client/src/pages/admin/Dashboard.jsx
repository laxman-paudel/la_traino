import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getUsers } from "../../api/admin";
import { SkeletonStatCard, SkeletonTable, SkeletonCard } from "../../components/Skeleton";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";

const roleBadge = {
  ADMIN: "bg-red-100 text-red-700",
  TRAINER: "bg-purple-100 text-purple-700",
  TRAINEE: "bg-green-100 text-green-700",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getDashboard(), getUsers()])
      .then(([dashRes, usersRes]) => {
        setData(dashRes.data);
        setUsers(usersRes.data);
      })
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load dashboard"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonTable rows={5} cols={4} /></div>
          <SkeletonCard rows={4} />
        </div>
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.isActive).length;
  const recentUsers = users.slice(0, 5);

  const statCards = [
    { label: "Total Users", value: data?.totalUsers, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Trainers", value: data?.totalTrainers, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Trainees", value: data?.totalTrainees, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Users", value: activeUsers, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of the system"
      />

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10 ${card.bg}`} />
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Recent Users">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No users yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 pr-4 font-medium">Email</th>
                      <th className="pb-3 pr-4 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-50">
                        <td className="py-3 pr-4 text-gray-900 font-medium">{user.name}</td>
                        <td className="py-3 pr-4 text-gray-500">{user.email}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              roleBadge[user.role]
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              user.isActive ? "bg-green-500" : "bg-red-400"
                            }`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Quick Actions">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition text-left"
              >
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">View and toggle user status</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/presets")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition text-left"
              >
                <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6.75V3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v3.25m9 0l3 3v7.5l-3 3m-9-13.5L4.5 9.75v7.5l3 3m9-13.5V3.5m0 3.25H7.5m9 0v7.5m-9-7.5v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Manage Presets</p>
                  <p className="text-xs text-gray-500">Create, edit and delete presets</p>
                </div>
              </button>
            </div>
          </SectionCard>

          <SectionCard title="System Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Server</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Users</span>
                <span className="text-sm font-semibold text-gray-900">{data?.totalUsers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {data?.totalUsers
                    ? Math.round((activeUsers / data.totalUsers) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
