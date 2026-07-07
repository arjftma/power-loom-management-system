<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'father_name',
        'cnic',
        'phone',
        'address',
        'email',
        'role',
        'designation',
        'department',
        'joining_date',
        'employment_type',
        'basic_salary',
        'status',
    ];

    protected $appends = ['employee_id', 'full_name', 'phone_no'];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'joining_date' => 'date',
    ];

    public function getEmployeeIdAttribute(): int
    {
        return (int) $this->id;
    }

    public function getFullNameAttribute(): ?string
    {
        return $this->name;
    }

    public function getPhoneNoAttribute(): ?string
    {
        return $this->phone;
    }

    public function salaryRecords(): HasMany
    {
        return $this->hasMany(SalaryRecord::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(EmployeeLoan::class);
    }

    public function activeLoans(): HasMany
    {
        return $this->loans()->where('is_active', true)->where('balance_remaining', '>', 0);
    }

    public function employeeAllowances(): HasMany
    {
        return $this->hasMany(EmployeeAllowance::class);
    }
}
