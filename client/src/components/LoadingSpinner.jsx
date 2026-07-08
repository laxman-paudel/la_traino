export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center flex-1">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );
}
