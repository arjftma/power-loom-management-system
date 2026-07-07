<?php

namespace App\Http\Controllers;

use App\Models\AllowanceType;
use App\Models\BonusType;
use App\Models\DeductionType;
use App\Models\LoanType;

class PayrollTypeController extends Controller
{
    public function allowanceTypes()
    {
        return response()->json(
            AllowanceType::query()->where('status', 'active')->orderBy('allowance_name')->get()
        );
    }

    public function bonusTypes()
    {
        return response()->json(
            BonusType::query()->where('status', 'active')->orderBy('bonus_name')->get()
        );
    }

    public function deductionTypes()
    {
        return response()->json(
            DeductionType::query()->where('status', 'active')->orderBy('deduction_name')->get()
        );
    }

    public function loanTypes()
    {
        return response()->json(
            LoanType::query()->where('status', 'active')->orderBy('loan_name')->get()
        );
    }
}
