<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'customer_name',
        'company_name',
        'cnic',
        'phone',
        'address',
        'email',
        'cnic_or_ntn',
        'customer_type',
        'credit_limit',
        'status',
    ];

    protected $appends = ['customer_id', 'phone_no'];

    protected $casts = [
        'credit_limit' => 'decimal:2',
    ];

    public function getCustomerIdAttribute(): int
    {
        return (int) $this->id;
    }

    public function getPhoneNoAttribute(): ?string
    {
        return $this->phone;
    }
}
