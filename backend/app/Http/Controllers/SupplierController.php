<?php

namespace App\Http\Controllers;

use App\Http\Concerns\MapsErdEntityInput;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    use MapsErdEntityInput;

    private function entityRules(bool $creating = true): array
    {
        return [
            'name' => ($creating ? 'required_without:company_name' : 'sometimes').'|string|max:255',
            'company_name' => ($creating ? 'required_without:name' : 'sometimes').'|string|max:255',
            'contact_person_name' => 'nullable|string|max:255',
            'contact_person_phone' => 'nullable|string|max:20',
            'office_phone' => 'nullable|string|max:20',
            'cnic' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'cnic_or_ntn' => 'nullable|string|max:20',
            'materials_supplied' => 'nullable|string|max:1000',
            'supplied_material_type' => 'nullable|string|max:1000',
            'status' => 'nullable|string|max:50',
        ];
    }

    private function persistFields(): array
    {
        return [
            'name', 'company_name', 'contact_person_name', 'contact_person_phone', 'office_phone',
            'cnic', 'phone', 'address', 'email', 'cnic_or_ntn', 'materials_supplied', 'supplied_material_type', 'status',
        ];
    }

    private function prepare(array $data): array
    {
        $data = $this->mapSupplierInput($data);
        if (empty($data['status'])) {
            $data['status'] = 'active';
        }
        if (empty($data['cnic_or_ntn']) && ! empty($data['cnic'])) {
            $data['cnic_or_ntn'] = $data['cnic'];
        }

        return $data;
    }

    public function index()
    {
        return response()->json(Supplier::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $this->prepare($request->only($this->persistFields()));
        $validated = validator($data, $this->entityRules(true))->validate();
        $item = Supplier::create(collect($validated)->only($this->persistFields())->all());

        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Supplier::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Supplier::findOrFail($id);
        $data = $this->prepare($request->only($this->persistFields()));
        $validated = validator($data, $this->entityRules(false))->validate();
        $item->update(collect($validated)->only($this->persistFields())->all());

        return response()->json($item);
    }

    public function destroy($id)
    {
        Supplier::destroy($id);

        return response()->json(['message' => 'Deleted successfully']);
    }
}
