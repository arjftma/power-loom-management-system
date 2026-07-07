<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Dispatch;
use App\Models\Employee;
use App\Models\Payment;
use App\Models\ProductionBatch;
use App\Models\Supplier;

class DashboardController extends Controller
{
    public function index()
    {
        $totalProduction = (float) (ProductionBatch::sum('meters_produced') ?? 0);
        $totalDispatch = (float) (Dispatch::sum('quantity') ?? 0);
        $stock = $totalProduction - $totalDispatch;

        $totalReceived = (float) (Payment::query()
            ->where('type', 'received_from_customer')
            ->sum('amount') ?? 0);
        $totalPaidOut = (float) (Payment::query()
            ->where('type', 'paid_to_supplier')
            ->sum('amount') ?? 0);
        $paymentNet = $totalReceived - $totalPaidOut;

        $recentProduction = ProductionBatch::latest()->take(5)->get();
        $recentDispatches = Dispatch::with('customer')->latest()->take(5)->get();

        return response()->json([
            'total_production' => $totalProduction,
            'total_dispatch' => $totalDispatch,
            'current_stock' => $stock,
            'total_received_from_customers' => $totalReceived,
            'total_paid_to_suppliers' => $totalPaidOut,
            'payment_cash_net' => $paymentNet,
            'counts' => [
                'employees' => Employee::query()->count(),
                'suppliers' => Supplier::query()->count(),
                'customers' => Customer::query()->count(),
                'payments' => Payment::query()->count(),
                'production_batches' => ProductionBatch::query()->count(),
                'dispatches' => Dispatch::query()->count(),
            ],
            'recent_production' => $recentProduction,
            'recent_dispatches' => $recentDispatches,
        ]);
    }
}
