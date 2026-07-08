import OverflowMenu from "./OverflowMenu";

const categoryColors = {
  protein: "bg-red-100 text-red-700",
  carbs: "bg-amber-100 text-amber-700",
  vegetables: "bg-green-100 text-green-700",
  fruits: "bg-orange-100 text-orange-700",
  dairy: "bg-blue-100 text-blue-700",
  grains: "bg-yellow-100 text-yellow-700",
  fats: "bg-purple-100 text-purple-700",
  beverages: "bg-cyan-100 text-cyan-700",
  snacks: "bg-pink-100 text-pink-700",
  condiments: "bg-gray-100 text-gray-700",
};

export default function FoodCard({ food, onView, onEdit, onDelete }) {
  const isCustom = !!food.trainerId;

  const menuItems = [
    { label: "View", onClick: () => onView(food) },
    ...(isCustom ? [
      { label: "Edit", onClick: () => onEdit(food) },
      { label: "Delete", danger: true, onClick: () => onDelete(food) },
    ] : []),
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{food.name}</h3>
          {isCustom && (
            <span className="text-[10px] font-semibold bg-indigo-500 text-white px-2 py-0.5 rounded-full shrink-0 ml-2">Custom</span>
          )}
          <OverflowMenu items={menuItems} />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryColors[food.category] || "bg-gray-100 text-gray-700"}`}>
            {food.category}
          </span>
        </div>

        {(food.calories || food.protein || food.carbs || food.fat) && (
          <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 mb-2">
            {food.calories && <span>{food.calories} cal</span>}
            {food.protein && <span>P: {food.protein}g</span>}
            {food.carbs && <span>C: {food.carbs}g</span>}
            {food.fat && <span>F: {food.fat}g</span>}
          </div>
        )}

        {food.servingSize && (
          <p className="text-xs text-gray-400">Serving: {food.servingSize}</p>
        )}
      </div>
    </div>
  );
}
