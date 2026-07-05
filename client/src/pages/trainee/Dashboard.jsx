import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function TraineeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const linkedTrainer = user?.traineeLinks?.[0]?.trainer;
  const selectedPreset = user?.traineeProfile?.selectedPreset;

  if (linkedTrainer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
            <div className="text-green-500 text-5xl mb-4">&#10003;</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Your Trainer
            </h1>
            <p className="text-lg text-gray-700 font-medium mb-2">
              {linkedTrainer.name}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm">
              <div className="text-gray-500">Trainer Code</div>
              <div className="text-gray-900 font-mono font-bold text-lg">
                {linkedTrainer.trainerProfile.trainerCode}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/trainee/workouts")}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
              >
                View Workouts
              </button>
              <button
                type="button"
                onClick={() => navigate("/trainee/diet")}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Today&apos;s Diet
              </button>
              <button
                type="button"
                onClick={() => navigate("/trainee/progress")}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
              >
                Weekly Progress
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-500 text-center">
              Use the buttons above to view workouts, diet plans, and progress.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Trainee Dashboard
        </h1>
        {selectedPreset ? (
          <>
            <p className="text-gray-500 mb-2">Following preset routine</p>
            <p className="text-xl font-semibold text-gray-900 mb-6">
              {selectedPreset.name}
            </p>
            <button
              type="button"
              onClick={() => navigate("/trainee/workouts")}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
            >
              View Today&apos;s Workout
            </button>
            <button
              type="button"
              onClick={() => navigate("/trainee/progress")}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
            >
              Weekly Progress
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-6">
              Choose a preset workout routine to get started.
            </p>
            <button
              type="button"
              onClick={() => navigate("/trainee/presets")}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
            >
              Choose Workout Preset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
