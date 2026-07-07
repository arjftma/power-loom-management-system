<?php

namespace App\Http\Controllers;

use App\Http\Concerns\MapsErdEntityInput;
use App\Http\Concerns\NormalizesApiInput;
use App\Models\Dispatch;
use App\Models\ProductionBatch;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DispatchController extends Controller
{
    use MapsErdEntityInput;
    use NormalizesApiInput;

    private function availableFabricMetersForNewDispatch(): float
    {
        $produced = (float) (ProductionBatch::query()->sum('meters_produced') ?? 0);
        $dispatched = (float) (Dispatch::query()->sum('quantity') ?? 0);

        return $produced - $dispatched;
    }

    private function availableFabricMetersForUpdate(Dispatch $row): float
    {
        $produced = (float) (ProductionBatch::query()->sum('meters_produced') ?? 0);
        $dispatchedOthers = (float) (Dispatch::query()->whereKeyNot($row->id)->sum('quantity') ?? 0);

        return $produced - $dispatchedOthers;
    }

    private function assertQuantityWithinStock(float $quantity, float $maxMeters, string $field = 'quantity'): void
    {
        if ($quantity > $maxMeters + 0.000001) {
            throw ValidationException::withMessages([
                $field => [sprintf(
                    'Cannot dispatch %.2f m: only %.2f m available in stock (total production minus total dispatch).',
                    $quantity,
                    max(0, $maxMeters)
                )],
            ]);
        }
    }

    private function inputKeys(): array
    {
        return [
            'fabric_type', 'quantity', 'quantity_dispatched', 'date', 'dispatch_date',
            'customer_id', 'unit', 'vehicle_no', 'dispatch_challan_no', 'received_by', 'remarks',
        ];
    }

    private function rules(bool $creating = true): array
    {
        $req = $creating ? 'required' : 'sometimes';

        return [
            'fabric_type' => ($creating ? 'required' : 'sometimes').'|string|max:255',
            'quantity' => $req.'_without:quantity_dispatched|numeric|min:0',
            'quantity_dispatched' => $req.'_without:quantity|numeric|min:0',
            'date' => $req.'_without:dispatch_date|date',
            'dispatch_date' => $req.'_without:date|date',
            'customer_id' => 'nullable|integer|exists:customers,id',
            'unit' => 'nullable|string|max:20',
            'vehicle_no' => 'nullable|string|max:50',
            'dispatch_challan_no' => 'nullable|string|max:100',
            'received_by' => 'nullable|string|max:255',
            'remarks' => 'nullable|string|max:2000',
        ];
    }

    private function persist(array $validated): array
    {
        return [
            'fabric_type' => $validated['fabric_type'],
            'quantity' => $validated['quantity'] ?? $validated['quantity_dispatched'],
            'date' => $validated['date'] ?? $validated['dispatch_date'],
            'customer_id' => $this->nullableForeignKey($validated['customer_id'] ?? null),
            'unit' => $validated['unit'] ?? 'm',
            'vehicle_no' => $validated['vehicle_no'] ?? null,
            'dispatch_challan_no' => $validated['dispatch_challan_no'] ?? null,
            'received_by' => $validated['received_by'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
        ];
    }

    public function index()
    {
        return response()->json(Dispatch::with('customer')->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $this->mapDispatchInput($request->only($this->inputKeys()));
        if (array_key_exists('customer_id', $data)) {
            $data['customer_id'] = $this->nullableForeignKey($data['customer_id']);
        }

        $validated = validator($data, $this->rules(true))->validate();
        $payload = $this->persist($validated);

        $qty = (float) $payload['quantity'];
        $this->assertQuantityWithinStock($qty, $this->availableFabricMetersForNewDispatch());

        $item = Dispatch::create($payload);

        return response()->json($item->load('customer'), 201);
    }

    public function show($id)
    {
        return response()->json(Dispatch::with('customer')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Dispatch::findOrFail($id);
        $data = $this->mapDispatchInput($request->only($this->inputKeys()));
        if (array_key_exists('customer_id', $data)) {
            $data['customer_id'] = $this->nullableForeignKey($data['customer_id']);
        }

        $validated = validator($data, $this->rules(false))->validate();
        $payload = $this->persist($validated);

        $newQty = array_key_exists('quantity', $payload)
            ? (float) $payload['quantity']
            : (float) $item->quantity;
        $this->assertQuantityWithinStock($newQty, $this->availableFabricMetersForUpdate($item));

        $item->update(array_filter($payload, fn ($v) => $v !== null));

        return response()->json($item->fresh('customer'));
    }

    public function destroy($id)
    {
        Dispatch::destroy($id);

        return response()->json(['message' => 'Deleted successfully']);
    }
}
