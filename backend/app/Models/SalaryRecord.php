<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalaryRecord extends Model
{
    protected $fillable = [
        'payroll_id',
        'employee_id',
        'basic_salary',
        'gross_salary',
        'total_allowances',
        'total_bonuses',
        'total_deductions',
        'total_loan_installments',
        'net_salary',
        'payment_date',
        'payment_method',
        'status',
    ];

    protected $appends = ['payroll_month', 'payroll_year'];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'total_allowances' => 'decimal:2',
        'total_bonuses' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'total_loan_installments' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function getPayrollMonthAttribute(): ?int
    {
        return $this->relationLoaded('payroll') || $this->payroll
            ? (int) $this->payroll?->month
            : null;
    }

    public function getPayrollYearAttribute(): ?int
    {
        return $this->relationLoaded('payroll') || $this->payroll
            ? (int) $this->payroll?->year
            : null;
    }

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function allowances(): HasMany
    {
        return $this->hasMany(Allowance::class);
    }

    public function bonuses(): HasMany
    {
        return $this->hasMany(Bonus::class);
    }

    public function deductions(): HasMany
    {
        return $this->hasMany(Deduction::class);
    }

    public function loanInstallments(): HasMany
    {
        return $this->hasMany(LoanInstallment::class);
    }
}
