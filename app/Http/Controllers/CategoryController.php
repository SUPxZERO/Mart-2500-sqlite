<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    /** API: GET /api/categories — JSON list for Item form dropdowns */
    public function apiIndex()
    {
        return response()->json(
            Category::orderBy('sort_order')->orderBy('name')->pluck('name')
        );
    }

    /** WEB: GET /categories */
    public function index()
    {
        $categories = Category::orderBy('sort_order')->orderBy('name')->get();
        return Inertia::render('Categories/Index', [
            'categories' => $categories
        ]);
    }

    /** WEB/API: POST /categories */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:categories,name',
        ]);

        $category = Category::create([
            'name'       => $validated['name'],
            'sort_order' => Category::max('sort_order') + 1,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['id' => $category->id, 'name' => $category->name], 201);
        }

        return redirect()->back()->with('success', 'Category created successfully');
    }

    /** WEB: PUT /categories/{category} */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:categories,name,' . $category->id,
        ]);

        $oldName = $category->name;
        $newName = $validated['name'];

        DB::transaction(function () use ($category, $oldName, $newName) {
            $category->update(['name' => $newName]);
            
            // Cascade string updates to items
            if ($oldName !== $newName) {
                \App\Models\Item::where('category', $oldName)->update(['category' => $newName]);
            }
        });

        return redirect()->back()->with('success', 'Category updated successfully');
    }

    /** WEB: DELETE /categories/{category} */
    public function destroy(Category $category)
    {
        $count = \App\Models\Item::where('category', $category->name)->count();
        if ($count > 0) {
            return redirect()->back()->withErrors([
                'delete' => "Cannot delete \"{$category->name}\" — {$count} item(s) use it."
            ]);
        }

        $category->delete();
        return redirect()->back()->with('success', 'Category deleted successfully');
    }
}
