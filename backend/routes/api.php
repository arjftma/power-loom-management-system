<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductionBatchController;
use App\Http\Controllers\DispatchController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StockReportController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\EmployeeLoanController;
use App\Http\Controllers\PayrollTypeController;
use App\Http\Controllers\EmployeeAllowanceController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Profile Settings Routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile/update', [ProfileController::class, 'update']);
    Route::post('/profile/password', [ProfileController::class, 'changePassword']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/reports/fabric-stock-by-date', [StockReportController::class, 'fabricAddedByDate']);

    Route::apiResource('production', ProductionBatchController::class);
    Route::apiResource('dispatch', DispatchController::class);
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('payments', PaymentController::class);

    Route::apiResource('payrolls', PayrollController::class)->except(['update']);
    Route::post('payrolls/{payroll}/generate', [PayrollController::class, 'generate']);
    Route::post('payrolls/{payroll}/recalculate', [PayrollController::class, 'recalculatePayroll']);
    Route::post('salary-records/{record}/recalculate', [PayrollController::class, 'recalculateSalaryRecord']);
    Route::put('salary-records/{record}', [PayrollController::class, 'updateSalaryRecord']);
    Route::post('salary-records/{record}/allowances', [PayrollController::class, 'storeAllowance']);
    Route::post('salary-records/{record}/bonuses', [PayrollController::class, 'storeBonus']);
    Route::post('salary-records/{record}/deductions', [PayrollController::class, 'storeDeduction']);
    Route::delete('allowances/{allowance}', [PayrollController::class, 'destroyAllowance']);
    Route::delete('bonuses/{bonus}', [PayrollController::class, 'destroyBonus']);
    Route::delete('deductions/{deduction}', [PayrollController::class, 'destroyDeduction']);

    Route::apiResource('employee-loans', EmployeeLoanController::class)->except(['update']);
    Route::put('employee-loans/{employee_loan}', [EmployeeLoanController::class, 'update']);

    Route::get('allowance-types', [PayrollTypeController::class, 'allowanceTypes']);
    Route::get('bonus-types', [PayrollTypeController::class, 'bonusTypes']);
    Route::get('deduction-types', [PayrollTypeController::class, 'deductionTypes']);
    Route::get('loan-types', [PayrollTypeController::class, 'loanTypes']);
    Route::get('employee-allowances', [EmployeeAllowanceController::class, 'index']);
    Route::post('employee-allowances', [EmployeeAllowanceController::class, 'store']);
    Route::delete('employee-allowances/{employee_allowance}', [EmployeeAllowanceController::class, 'destroy']);
});
