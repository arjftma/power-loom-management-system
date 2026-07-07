<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payroll extends Model
{
    protected $fillable = ['year', 'month', 'title', 'status', 'generated_at'];

    protected $casts = [
        'generated_at' => 'datetime',
    ];

    public function salaryRecords(): HasMany
    {
        return $this->hasMany(SalaryRecord::class);
    }
}
