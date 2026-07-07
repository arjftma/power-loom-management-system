<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanType extends Model
{
    protected $fillable = ['loan_name', 'interest_rate', 'description', 'status'];

    protected $casts = [
        'interest_rate' => 'decimal:2',
    ];
}
