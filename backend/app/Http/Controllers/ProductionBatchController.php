<?php

namespace App\Http\Controllers;

use App\Http\Concerns\MapsErdEntityInput;
use App\Http\Concerns\NormalizesApiInput;
use App\Models\ProductionBatch;
use Illuminate\Http\Request;

class ProductionBatchController extends Controller
{
    use MapsErdEntityInput;
    use NormalizesApiInput;

    private function inputKeys(): array
    {
        return [
            'loom_number', 'loom_no', 'fabric_type', 'date', 'production_date',
            'meters_produced', 'quantity_produced', 'employee_id', 'supplier_id',
            'unit', 'quality_grade', 'remarks',
        ];
    }

    private function rules(bool $creating = true): array
    {
        $req = $creating ? 'required' : 'sometimes';

        return [
            'loom_number' => $req.'_without:loom_no|string|max:255',
            'loom_no' => $req.'_without:loom_number|string|max:255',
            'fabric_type' => ($creating ? 'required' : 'sometimes').'|string|max:255',
            'date' => $req.'_without:production_date|date',
            'production_date' => $req.'_without:date|date',
            'meters_produced' => $req.'_without:quantity_produced|numeric|min:0',
            'quantity_produced' => $req.'_without:meters_produced|numeric|min:0',
            'employee_id' => 'nullable|integer|exists:employees,id',
            'supplier_id' => 'nullable|integer|exists:suppliers,id',
            'unit' => 'nullable|string|max:20',
            'quality_grade' => 'nullable|string|max:50',
            'remarks' => 'nullable|string|max:2000',
        ];
    }

    private function persist(array $validated): array
    {
        return [
            'loom_number' => $validated['loom_number'] ?? $validated['loom_no'],
            'fabric_type' => $validated['fabric_type'],
            'date' => $validated['date'] ?? $validated['production_date'],
            'meters_produced' => $validated['meters_produced'] ?? $validated['quantity_produced'],
            'employee_id' => $this->nullableForeignKey($validated['employee_id'] ?? null),
            'supplier_id' => $this->nullableForeignKey($validated['supplier_id'] ?? null),
            'unit' => $validated['unit'] ?? 'm',
            'quality_grade' => $validated['quality_grade'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
        ];
    }

    public function index()
    {
        return response()->json(
            ProductionBatch::with(['employee', 'supplier'])->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $data = $this->mapProductionInput($request->only($this->inputKeys()));
        $validated = validator($data, $this->rules(true))->validate();
        $item = ProductionBatch::create($this->persist($validated));

        return response()->json($item->load(['employee', 'supplier']), 201);
    }

    public function show($id)
    {
        return response()->json(
            ProductionBatch::with(['employee', 'supplier'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $item = ProductionBatch::findOrFail($id);
        $data = $this->mapProductionInput($request->only($this->inputKeys()));
        $validated = validator($data, $this->rules(false))->validate();
        $item->update(array_filter($this->persist($validated), fn ($v) => $v !== null));

        return response()->json($item->fresh(['employee', 'supplier']));
    }

    public function destroy($id)
    {
        ProductionBatch::destroy($id);

        return response()->json(['message' => 'Deleted successfully']);
    }
}
