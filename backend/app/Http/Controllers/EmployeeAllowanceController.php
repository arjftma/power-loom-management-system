<?php

namespace App\Http\Controllers;

use App\Models\EmployeeAllowance;
use Illuminate\Http\Request;

class EmployeeAllowanceController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeeAllowance::with(['employee', 'allowanceType'])->latest();
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|integer|exists:employees,id',
            'allowance_type_id' => 'required|integer|exists:allowance_types,id',
            'default_amount' => 'required|numeric|min:0',
            'status' => 'nullable|string|max:50',
        ]);

        $item = EmployeeAllowance::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'allowance_type_id' => $validated['allowance_type_id'],
            ],
            [
                'default_amount' => round((float) $validated['default_amount'], 2),
                'status' => $validated['status'] ?? 'active',
            ]
        );

        return response()->json($item->load(['employee', 'allowanceType']), 201);
    }

    public function destroy($id)
    {
        EmployeeAllowance::destroy($id);

        return response()->json(['message' => 'Deleted successfully']);
    }
}
