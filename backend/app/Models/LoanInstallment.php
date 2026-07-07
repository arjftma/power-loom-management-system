<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanInstallment extends Model
{
    protected $fillable = ['salary_record_id', 'employee_loan_id', 'amount', 'remaining_balance'];

    protected $casts = [
        'amount' => 'decimal:2',
        'remaining_balance' => 'decimal:2',
    ];

    public function salaryRecord(): BelongsTo
    {
        return $this->belongsTo(SalaryRecord::class);
    }

    public function employeeLoan(): BelongsTo
    {
        return $this->belongsTo(EmployeeLoan::class);
    }
}
