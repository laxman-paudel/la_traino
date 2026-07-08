import { useState, useEffect, useCallback } from "react";
import { getFoods, createFood, updateFood, deleteFood } from "../../api/foods";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { SkeletonCard } from "../../components/Skeleton";
import FoodCard from "../../components/FoodCard";
import FoodForm from "../../components/FoodForm";

export default function FoodLibrary() {
  const { addToast } = useToast();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [formModal, setFormModal] = useState(null);
  const [viewFood, setViewFood] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFoods = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;
    if (ownerFilter) params.owner = ownerFilter;

    getFoods(params)
      .then((res) => setFoods(res.data || []))
      .catch(() => addToast("Failed to load foods", "error"))
      .finally(() => setLoading(false));
  }, [search, categoryFilter, ownerFilter, addToast]);

  useEffect(() => {
    setLoading(true);
    fetchFoods();
  }, [fetchFoods]);

  async function handleSave(data) {
    try {
      if (formModal === "add") {
        const res = await createFood(data);
        setFoods((prev) => [res.data, ...prev]);
        addToast("Food created", "success");
      } else {
        const res = await updateFood(formModal.id, data);
        setFoods((prev) => prev.map((f) => (f.id === formModal.id ? res.data : f)));
        addToast("Food updated", "success");
      }
      setFormModal(null);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to save food", "error");
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await deleteFood(id);
      setFoods((prev) => prev.filter((f) => f.id !== id));
      setDeleteTarget(null);
      addToast("Food deleted", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to delete", "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const categories = [...new Set(foods.map((f) => f.category))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Food Library"
        subtitle="Centralized food database"
        actions={
          <button type="button" onClick={() => setFormModal("add")}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm shadow-indigo-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Food
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search foods..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700">
          <option value="">All Foods</option>
          <option value="official">Official</option>
          <option value="mine">My Custom Foods</option>
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} rows={3} />)}
        </div>
      ) : foods.length === 0 ? (
        <EmptyState icon="clipboard" title="No Foods Found"
          message={search || categoryFilter || ownerFilter ? "Try different filters." : "Add your first food to the library."}
          action={!search && !categoryFilter && !ownerFilter ? (
            <button type="button" onClick={() => setFormModal("add")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold">Add Food</button>
          ) : null}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {foods.map((f) => (
            <FoodCard key={f.id} food={f} onView={setViewFood} onEdit={(food) => setFormModal({ type: "edit", id: food.id, food })}
              onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* View modal */}
      {viewFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setViewFood(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{viewFood.name}</h2>
              <button type="button" onClick={() => setViewFood(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{viewFood.category}</span>
              </div>
              {viewFood.description && <p className="text-sm text-gray-600">{viewFood.description}</p>}
              {viewFood.servingSize && <p className="text-sm text-gray-500">Serving: {viewFood.servingSize}</p>}
              {(viewFood.calories || viewFood.protein || viewFood.carbs || viewFood.fat) && (
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                  {viewFood.calories && <div><span className="text-xs text-gray-400">Calories</span><p className="text-sm font-semibold text-gray-900">{viewFood.calories}</p></div>}
                  {viewFood.protein && <div><span className="text-xs text-gray-400">Protein</span><p className="text-sm font-semibold text-gray-900">{viewFood.protein}g</p></div>}
                  {viewFood.carbs && <div><span className="text-xs text-gray-400">Carbs</span><p className="text-sm font-semibold text-gray-900">{viewFood.carbs}g</p></div>}
                  {viewFood.fat && <div><span className="text-xs text-gray-400">Fat</span><p className="text-sm font-semibold text-gray-900">{viewFood.fat}g</p></div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {formModal && (
        <FoodForm food={formModal === "add" ? null : formModal.food} onSave={handleSave} onClose={() => setFormModal(null)} />
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Food" message={deleteTarget ? `Delete "${deleteTarget.name}"?` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"} cancelLabel="Cancel" danger
        onConfirm={() => handleDelete(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
