<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company_name',
        'contact_person_name',
        'contact_person_phone',
        'office_phone',
        'cnic',
        'phone',
        'address',
        'email',
        'cnic_or_ntn',
        'materials_supplied',
        'supplied_material_type',
        'status',
    ];

    protected $appends = ['supplier_id'];

    public function getSupplierIdAttribute(): int
    {
        return (int) $this->id;
    }
}
