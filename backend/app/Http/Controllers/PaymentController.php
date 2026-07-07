<?php

namespace App\Http\Controllers;

use App\Http\Concerns\NormalizesApiInput;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    use NormalizesApiInput;

    public function index()
    {
        return response()->json(Payment::with(['supplier', 'customer'])->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->only(['type', 'amount', 'date', 'remarks', 'supplier_id', 'customer_id']);
        $data['supplier_id'] = $this->nullableForeignKey($data['supplier_id'] ?? null);
        $data['customer_id'] = $this->nullableForeignKey($data['customer_id'] ?? null);

        $validated = validator($data, [
            'type' => ['required', Rule::in(['paid_to_supplier', 'received_from_customer'])],
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'remarks' => 'nullable|string|max:500',
            'supplier_id' => 'nullable|integer|exists:suppliers,id',
            'customer_id' => 'nullable|integer|exists:customers,id',
        ])->validate();

        $item = Payment::create($validated);

        return response()->json($item, 201);
    }

    public function show($id)
    {
        $withMethod = "->with(['supplier', 'customer'])";
        if ($withMethod) {
            $item = Payment::with(str_replace(['->with(', ')'], '', $withMethod))->findOrFail($id);
        } else {
            $item = Payment::findOrFail($id);
        }

        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $item = Payment::findOrFail($id);
        $data = $request->only(['type', 'amount', 'date', 'remarks', 'supplier_id', 'customer_id']);
        if (array_key_exists('supplier_id', $data)) {
            $data['supplier_id'] = $this->nullableForeignKey($data['supplier_id']);
        }
        if (array_key_exists('customer_id', $data)) {
            $data['customer_id'] = $this->nullableForeignKey($data['customer_id']);
        }

        $validated = validator($data, [
            'type' => ['sometimes', Rule::in(['paid_to_supplier', 'received_from_customer'])],
            'amount' => 'sometimes|numeric|min:0',
            'date' => 'sometimes|date',
            'remarks' => 'nullable|string|max:500',
            'supplier_id' => 'nullable|integer|exists:suppliers,id',
            'customer_id' => 'nullable|integer|exists:customers,id',
        ])->validate();

        $item->update($validated);

        return response()->json($item);
    }

    public function destroy($id)
    {
        Payment::destroy($id);

        return response()->json(['message' => 'Deleted successfully']);
    }
}
