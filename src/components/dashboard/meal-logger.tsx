"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function MealLogger() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  
  const [mealType, setMealType] = useState("BREAKFAST");
  const [quantityG, setQuantityG] = useState<number>(100);
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["foodSearch", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(debouncedQuery)}`);
      return res.json();
    },
    enabled: debouncedQuery.length >= 2,
  });

  const { data: meals = [], isLoading: isLoadingMeals } = useQuery({
    queryKey: ["meals"],
    queryFn: async () => {
      const res = await fetch("/api/meals");
      return res.json();
    }
  });

  const logMeal = useMutation({
    mutationFn: async () => {
      if (!selectedFood) return;
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: selectedFood.id,
          mealType,
          quantityG,
          portionLabel: selectedFood.servingSizeG === quantityG ? "1 serving" : `${quantityG}g`,
        })
      });
      if (!res.ok) throw new Error("Failed to log meal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      setSelectedFood(null);
      setQuery("");
    }
  });

  return (
    <div className="editorial-card p-6 lg:p-8 flex flex-col relative text-on-surface">

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <h3 className="font-headline-md text-[20px] font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">restaurant_menu</span>
          Log a Meal
        </h3>
      </div>
      
      {!selectedFood ? (
        <div className="space-y-4 relative z-10">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-3 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search INDB (e.g. Poha, Chicken, Roti)..."
              className="editorial-input w-full pl-8 pr-4 py-3 outline-none text-on-surface placeholder:text-on-surface-variant/50 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {isSearching && (
            <div className="flex items-center gap-2 text-[12px] text-primary font-label-caps uppercase tracking-widest">
              <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
              Searching...
            </div>
          )}
          
          {searchResults && searchResults.length > 0 && (
            <ul className="border border-outline-variant max-h-60 overflow-y-auto divide-y divide-outline-variant">
              {searchResults.map((food: any) => (
                <li 
                  key={food.id} 
                  className="p-4 hover:bg-surface-variant cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedFood(food);
                    setQuantityG(food.servingSizeG || 100);
                  }}
                >
                  <div className="font-bold text-on-surface mb-1">{food.name}</div>
                  <div className="text-[12px] text-on-surface-variant flex gap-3">
                    <span className="text-secondary font-bold">{food.caloriesPer100g} kcal/100g</span>
                    <span>{food.proteinG}g P</span>
                    <span>{food.carbsG}g C</span>
                    <span>{food.fatG}g F</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200 relative z-10">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <div>
              <div className="font-bold text-[18px] text-secondary mb-1">{selectedFood.name}</div>
              <div className="text-[14px] text-on-surface-variant font-medium">
                <span className="text-on-surface font-bold">{(selectedFood.caloriesPer100g * (quantityG / 100)).toFixed(0)} kcal</span> for {quantityG}g
              </div>
            </div>
            <button 
              onClick={() => setSelectedFood(null)} 
              className="text-[12px] font-label-caps uppercase tracking-widest font-bold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Change
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] font-label-caps mb-2 text-on-surface-variant uppercase tracking-widest">Meal Type</label>
              <select 
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="editorial-input w-full py-2 outline-none text-on-surface transition-all appearance-none cursor-pointer"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="SNACK">Snack</option>
                <option value="DINNER">Dinner</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-label-caps mb-2 text-on-surface-variant uppercase tracking-widest">Quantity (g)</label>
              <input
                type="number"
                value={quantityG}
                onChange={(e) => setQuantityG(Number(e.target.value))}
                className="editorial-input w-full py-2 outline-none text-on-surface transition-all"
              />
              {selectedFood.servingSizeG && (
                <button 
                  onClick={() => setQuantityG(selectedFood.servingSizeG)}
                  className="text-[10px] text-primary mt-2 font-bold hover:underline"
                >
                  Set to 1 serving ({selectedFood.servingSizeG}g)
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => logMeal.mutate()}
            disabled={logMeal.isPending}
            className="editorial-button w-full mt-2 py-3.5 px-4 font-label-caps text-[12px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {logMeal.isPending ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">add</span>
            )}
            {logMeal.isPending ? "Logging..." : "Log Meal"}
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-outline-variant flex-1 relative z-10">
        <h4 className="font-label-caps text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Today's Meals</h4>
        {isLoadingMeals ? (
          <div className="flex items-center gap-2 text-[12px] text-on-surface-variant font-label-caps uppercase tracking-widest">
            <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
            Loading meals...
          </div>
        ) : meals.length === 0 ? (
          <div className="text-[14px] text-on-surface-variant italic">No meals logged today.</div>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {meals.map((meal: any) => (
              <li key={meal.id} className="flex justify-between items-center py-4">
                <div>
                  <div className="font-bold text-[14px] text-on-surface mb-1">{meal.food.name}</div>
                  <div className="text-[12px] text-on-surface-variant flex items-center gap-2">
                    <span className="text-secondary font-label-caps uppercase font-bold tracking-widest">
                      {meal.mealType}
                    </span>
                    <span>•</span>
                    <span>{meal.quantityG}g</span>
                  </div>
                </div>
                <div className="text-right font-bold text-secondary text-[16px]">
                  {((meal.food.caloriesPer100g * meal.quantityG) / 100).toFixed(0)} <span className="text-[10px] text-on-surface-variant font-normal">kcal</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
