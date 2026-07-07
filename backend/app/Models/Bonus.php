<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bonus extends Model
{
    protected $fillable = ['salary_record_id', 'bonus_type_id', 'title', 'amount'];

    protected $casts = ['amount' => 'decimal:2'];

    public function bonusType(): BelongsTo
    {
        return $this->belongsTo(BonusType::class);
    }

    public function salaryRecord(): BelongsTo
    {
        return $this->belongsTo(SalaryRecord::class);
    }
}
