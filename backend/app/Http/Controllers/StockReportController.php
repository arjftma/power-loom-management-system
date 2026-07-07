<?php

namespace App\Http\Controllers;

use App\Models\ProductionBatch;
use Carbon\Carbon;

class StockReportController extends Controller
{
    /**
     * Fabric added to stock (production batches), grouped by production date (newest first).
     */
    public function fabricAddedByDate()
    {
        $batches = ProductionBatch::query()
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $byDate = $batches
            ->groupBy(fn (ProductionBatch $b) => Carbon::parse($b->date)->toDateString())
            ->map(function ($items, $date) {
                return [
                    'date' => $date,
                    'total_meters' => round((float) $items->sum(fn (ProductionBatch $i) => (float) $i->meters_produced), 2),
                    'batch_count' => $items->count(),
                    'batches' => $items->values()->map(function (ProductionBatch $b) {
                        return [
                            'id' => $b->id,
                            'loom_number' => $b->loom_number,
                            'fabric_type' => $b->fabric_type,
                            'date' => Carbon::parse($b->date)->toDateString(),
                            'meters_produced' => round((float) $b->meters_produced, 2),
                            'created_at' => $b->created_at?->toIso8601String(),
                        ];
                    })->all(),
                ];
            })
            ->values()
            ->sortByDesc('date')
            ->values();

        return response()->json([
            'summary' => [
                'total_production_meters' => round((float) (ProductionBatch::query()->sum('meters_produced') ?? 0), 2),
                'total_batches' => ProductionBatch::query()->count(),
            ],
            'by_date' => $byDate,
        ]);
    }
}
