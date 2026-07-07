<?php

namespace App\Services;

use App\Models\SalaryRecord;

class PayrollCalculationService
{
    /**
     * gross = basic + allowances + bonuses
     * net = gross - deductions - loan installments
     */
    public function recalculate(SalaryRecord $record): SalaryRecord
    {
        $record->loadMissing(['employee', 'allowances', 'bonuses', 'deductions', 'loanInstallments']);

        $basic = (float) ($record->employee->basic_salary ?? $record->basic_salary ?? 0);
        $allowances = (float) $record->allowances->sum('amount');
        $bonuses = (float) $record->bonuses->sum('amount');
        $deductions = (float) $record->deductions->sum('amount');
        $loanInstallments = (float) $record->loanInstallments->sum('amount');

        $gross = $basic + $allowances + $bonuses;
        $net = $gross - $deductions - $loanInstallments;

        $record->update([
            'basic_salary' => round($basic, 2),
            'gross_salary' => round($gross, 2),
            'total_allowances' => round($allowances, 2),
            'total_bonuses' => round($bonuses, 2),
            'total_deductions' => round($deductions, 2),
            'total_loan_installments' => round($loanInstallments, 2),
            'net_salary' => round(max(0, $net), 2),
        ]);

        return $record->fresh([
            'employee',
            'payroll',
            'allowances.allowanceType',
            'bonuses.bonusType',
            'deductions.deductionType',
            'loanInstallments.employeeLoan',
        ]);
    }
}
