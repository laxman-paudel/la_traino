import { useState, useEffect } from "react";
import { getTodayDiet } from "../../api/trainee";

export default function Diet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTodayDiet()
      .then((res) => setData(res.data))
      .catch((err) => {
        const msg = err.response?.data?.error || "Failed to load today's diet";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Today&apos;s Diet
        </h1>

        {error ? (
          <div
            role="alert"
            className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-center"
          >
            <p className="text-gray-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <p className="text-sm text-gray-500 mb-1">Day</p>
              <p className="text-xl font-semibold text-gray-900">{data?.day}</p>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-4">Meals</h2>

            <div className="space-y-3">
              {data?.meals?.map((meal, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {meal.time}
                  </h3>
                  <ul className="space-y-1">
                    {meal.items?.map((item, i) => (
                      <li
                        key={i}
                        className="text-gray-600 text-sm flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
