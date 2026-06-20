<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $items = Item::when($search, fn($q) => $q->where('name', 'like', "%{$search}%")
                                                  ->orWhere('category', 'like', "%{$search}%"))
            ->orderBy('category')
            ->orderBy('name')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Items/Index', [
            'items' => $items,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Items/Form', [
            'item' => null,
            'categories' => $this->getCategories(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100|unique:items,name',
            'default_cost'  => 'required|integer|min:0',
            'default_price' => 'required|integer|min:1',
            'category'      => 'required|string|max:50',
            'is_active'     => 'boolean',
            'image'         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('items', 'public');
        }

        Item::create([
            'name'          => $validated['name'],
            'default_cost'  => $validated['default_cost'],
            'default_price' => $validated['default_price'],
            'category'      => $validated['category'],
            'is_active'     => $validated['is_active'] ?? true,
            'image_path'    => $imagePath,
        ]);

        return redirect()->route('items.index')->with('success', 'Item created successfully!');
    }

    public function edit(Item $item)
    {
        return Inertia::render('Items/Form', [
            'item' => $item,
            'categories' => $this->getCategories(),
        ]);
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100|unique:items,name,' . $item->id,
            'default_cost'  => 'required|integer|min:0',
            'default_price' => 'required|integer|min:1',
            'category'      => 'required|string|max:50',
            'is_active'     => 'boolean',
            'image'         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }
            $item->image_path = $request->file('image')->store('items', 'public');
        }

        $item->fill([
            'name'          => $validated['name'],
            'default_cost'  => $validated['default_cost'],
            'default_price' => $validated['default_price'],
            'category'      => $validated['category'],
            'is_active'     => $validated['is_active'] ?? true,
        ])->save();

        return redirect()->route('items.index')->with('success', 'Item updated successfully!');
    }

    public function destroy(Item $item)
    {
        // Soft-delete: mark inactive so invoice history is preserved
        $item->update(['is_active' => false]);
        return back()->with('success', "{$item->name} deactivated.");
    }

    public function restore(Item $item)
    {
        $item->update(['is_active' => true]);
        return back()->with('success', "{$item->name} reactivated.");
    }

    private function getCategories(): array
    {
        return Category::orderBy('sort_order')->orderBy('name')->pluck('name')->toArray();
    }
}
