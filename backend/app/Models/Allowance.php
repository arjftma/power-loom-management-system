<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Allowance extends Model
{
    protected $fillable = ['salary_record_id', 'allowance_type_id', 'title', 'amount'];

    protected $casts = ['amount' => 'decimal:2'];

    public function allowanceType(): BelongsTo
    {
        return $this->belongsTo(AllowanceType::class);
    }

    public function salaryRecord(): BelongsTo
    {
        return $this->belongsTo(SalaryRecord::class);
    }
}
