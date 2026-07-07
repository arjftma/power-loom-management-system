<?php

namespace App\Http\Controllers;

use App\Http\Concerns\MapsErdEntityInput;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use MapsErdEntityInput;

    private function entityRules(bool $creating = true): array
    {
        return [
            'name' => ($creating ? 'required_without:customer_name' : 'sometimes').'|string|max:255',
            'customer_name' => ($creating ? 'required_without:name' : 'sometimes').'|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'cnic' => 'nullable|string|max:15',
            'phone' => 'nullable|string|max:20',
            'phone_no' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'cnic_or_ntn' => 'nullable|string|max:20',
            'customer_type' => 'nullable|string|max:100',
            'credit_limit' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|max:50',
        ];
    }

    private function persistFields(): array
    {
        return [
            'name', 'customer_name', 'company_name', 'cnic', 'phone', 'address', 'email',
            'cnic_or_ntn', 'customer_type', 'credit_limit', 'status',
        ];
    }

    private function prepare(array $data): array
    {
        $data = $this->mapCustomerInput($data);
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
        return response()->json(Customer::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $this->prepare($request->only(array_merge($this->persistFields(), ['phone_no'])));
        $validated = validator($data, $this->entityRules(true))->validate();
        $item = Customer::create(collect($validated)->only($this->persistFields())->all());

        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Customer::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Customer::findOrFail($id);
        $data = $this->prepare($request->only(array_merge($this->persistFields(), ['phone_no'])));
        $validated = validator($data, $this->entityRules(false))->validate();
        $item->update(collect($validated)->only($this->persistFields())->all());

        return response()->json($item);
    }

    public function destroy($id)
    {
        Customer::destroy($id);

        return response()->json(['message' => 'Deleted successfully']);
    }
}
