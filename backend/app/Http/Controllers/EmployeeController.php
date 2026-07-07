<?php

namespace App\Http\Controllers;

use App\Http\Concerns\MapsErdEntityInput;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    use MapsErdEntityInput;

    private function entityRules(bool $creating = true): array
    {
        return [
            'name' => ($creating ? 'required_without:full_name' : 'sometimes').'|string|max:255',
            'full_name' => ($creating ? 'required_without:name' : 'sometimes').'|string|max:255',
            'father_name' => 'nullable|string|max:255',
            'cnic' => 'nullable|string|max:15',
            'phone' => 'nullable|string|max:20',
            'phone_no' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'role' => ($creating ? 'required_without:designation' : 'sometimes').'|'.Rule::in(['weaver', 'helper']),
            'designation' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'joining_date' => 'nullable|date',
            'employment_type' => 'nullable|string|max:100',
            'basic_salary' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|max:50',
        ];
    }

    private function persistFields(): array
    {
        return [
            'name', 'father_name', 'cnic', 'phone', 'address', 'email', 'role',
            'designation', 'department', 'joining_date', 'employment_type', 'basic_salary', 'status',
        ];
    }

    private function prepare(array $data): array
    {
        $data = $this->mapEmployeeInput($data);
        if (empty($data['designation']) && ! empty($data['role'])) {
            $data['designation'] = $data['role'];
        }
        if (empty($data['status'])) {
            $data['status'] = 'active';
        }

        return $data;
    }

    public function index()
    {
        return response()->json(Employee::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $this->prepare($request->only(array_merge($this->persistFields(), ['full_name', 'phone_no'])));
        $validated = validator($data, $this->entityRules(true), [
            'role.in' => 'Role must be exactly "weaver" or "helper".',
        ])->validate();

        $item = Employee::create(collect($validated)->only($this->persistFields())->all());

        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Employee::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Employee::findOrFail($id);
        $data = $this->prepare($request->only(array_merge($this->persistFields(), ['full_name', 'phone_no'])));
        $validated = validator($data, $this->entityRules(false), [
            'role.in' => 'Role must be exactly "weaver" or "helper".',
        ])->validate();

        $item->update(collect($validated)->only($this->persistFields())->all());

        return response()->json($item);
    }

    public function destroy($id)
    {
        Employee::destroy($id);

        return response()->json(['message' => 'Deleted successfully']);
    }
}
