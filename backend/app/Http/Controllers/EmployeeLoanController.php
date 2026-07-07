<?php

namespace App\Http\Controllers;

use App\Models\EmployeeLoan;
use App\Models\LoanType;
use Illuminate\Http\Request;

class EmployeeLoanController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeeLoan::with(['employee', 'loanType'])->latest();
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|integer|exists:employees,id',
            'loan_type_id' => 'nullable|integer|exists:loan_types,id',
            'title' => 'nullable|string|max:255',
            'principal_amount' => 'required|numeric|min:0',
            'installment_amount' => 'required|numeric|min:0',
            'start_date' => 'nullable|date',
            'is_active' => 'sometimes|boolean',
        ]);

        $principal = round((float) $validated['principal_amount'], 2);
        $title = $validated['title'] ?? null;
        if (! $title && ! empty($validated['loan_type_id'])) {
            $title = LoanType::find($validated['loan_type_id'])?->loan_name;
        }

        $item = EmployeeLoan::create([
            'employee_id' => $validated['employee_id'],
            'loan_type_id' => $validated['loan_type_id'] ?? null,
            'title' => $title ?? 'Employee loan',
            'principal_amount' => $principal,
            'balance_remaining' => $principal,
            'remaining_balance' => $principal,
            'installment_amount' => round((float) $validated['installment_amount'], 2),
            'start_date' => $validated['start_date'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json($item->load(['employee', 'loanType']), 201);
    }

    public function show($id)
    {
        return response()->json(EmployeeLoan::with(['employee', 'loanType', 'loanInstallments'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = EmployeeLoan::findOrFail($id);
        $validated = $request->validate([
            'loan_type_id' => 'nullable|integer|exists:loan_types,id',
            'title' => 'sometimes|string|max:255',
            'installment_amount' => 'sometimes|numeric|min:0',
            'start_date' => 'nullable|date',
            'is_active' => 'sometimes|boolean',
        ]);

        $item->update($validated);

        return response()->json($item->fresh(['employee', 'loanType']));
    }

    public function destroy($id)
    {
        EmployeeLoan::destroy($id);

        return response()->json(['message' => 'Deleted successfully']);
    }
}
