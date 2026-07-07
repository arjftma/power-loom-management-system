<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeLoan extends Model
{
    protected $fillable = [
        'employee_id',
        'loan_type_id',
        'title',
        'principal_amount',
        'balance_remaining',
        'remaining_balance',
        'installment_amount',
        'start_date',
        'is_active',
    ];

    protected $casts = [
        'principal_amount' => 'decimal:2',
        'balance_remaining' => 'decimal:2',
        'remaining_balance' => 'decimal:2',
        'installment_amount' => 'decimal:2',
        'start_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function loanType(): BelongsTo
    {
        return $this->belongsTo(LoanType::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function loanInstallments(): HasMany
    {
        return $this->hasMany(LoanInstallment::class);
    }
}
