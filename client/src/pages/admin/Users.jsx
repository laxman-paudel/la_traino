import { useState, useEffect } from "react";
import { getUsers, toggleUserStatus } from "../../api/admin";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load users"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(id) {
    setToggling(id);
    try {
      const res = await toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to toggle status");
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Users</h1>
        <p className="text-gray-500 mb-8">View and manage user accounts.</p>

        {error && (
          <div
            role="alert"
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-red-100 text-red-700"
                            : user.role === "TRAINER"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {user.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggle(user.id)}
                        disabled={toggling === user.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          user.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {toggling === user.id
                          ? "..."
                          : user.isActive
                            ? "Disable"
                            : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
