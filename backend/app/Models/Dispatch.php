<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'fabric_type',
        'quantity',
        'customer_id',
        'date',
        'unit',
        'vehicle_no',
        'dispatch_challan_no',
        'received_by',
        'remarks',
    ];

    protected $appends = [
        'dispatch_id',
        'dispatch_date',
        'quantity_dispatched',
    ];

    protected $casts = [
        'date' => 'date',
        'quantity' => 'decimal:2',
    ];

    public function getDispatchIdAttribute(): int
    {
        return (int) $this->id;
    }

    public function getDispatchDateAttribute(): ?string
    {
        return $this->date?->format('Y-m-d') ?? $this->attributes['date'] ?? null;
    }

    public function getQuantityDispatchedAttribute(): ?string
    {
        return $this->quantity;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
