<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'loom_number',
        'fabric_type',
        'date',
        'meters_produced',
        'employee_id',
        'supplier_id',
        'unit',
        'quality_grade',
        'remarks',
    ];

    protected $appends = [
        'production_id',
        'production_date',
        'loom_no',
        'quantity_produced',
    ];

    protected $casts = [
        'date' => 'date',
        'meters_produced' => 'decimal:2',
    ];

    public function getProductionIdAttribute(): int
    {
        return (int) $this->id;
    }

    public function getProductionDateAttribute(): ?string
    {
        return $this->date?->format('Y-m-d') ?? $this->attributes['date'] ?? null;
    }

    public function getLoomNoAttribute(): ?string
    {
        return $this->loom_number;
    }

    public function getQuantityProducedAttribute(): ?string
    {
        return $this->meters_produced;
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
