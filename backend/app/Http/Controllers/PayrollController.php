<?php



namespace App\Http\Controllers;



use App\Models\Allowance;

use App\Models\AllowanceType;

use App\Models\Bonus;

use App\Models\BonusType;

use App\Models\Deduction;

use App\Models\DeductionType;

use App\Models\Employee;

use App\Models\EmployeeLoan;

use App\Models\LoanInstallment;

use App\Models\Payroll;

use App\Models\SalaryRecord;

use App\Services\PayrollCalculationService;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;



class PayrollController extends Controller

{

    public function __construct(private PayrollCalculationService $calculator) {}



    public function index()

    {

        return response()->json(

            Payroll::query()->orderByDesc('year')->orderByDesc('month')->get()

        );

    }



    public function store(Request $request)

    {

        $validated = $request->validate([

            'year' => 'required|integer|min:2000|max:2100',

            'month' => 'required|integer|min:1|max:12',

            'title' => 'nullable|string|max:255',

        ]);



        $payroll = Payroll::create([

            ...$validated,

            'title' => $validated['title'] ?? sprintf('%04d-%02d payroll', $validated['year'], $validated['month']),

            'status' => 'draft',

        ]);



        return response()->json($payroll, 201);

    }



    public function show($id)

    {

        $payroll = Payroll::with([

            'salaryRecords.employee',

            'salaryRecords.payroll',

            'salaryRecords.allowances.allowanceType',

            'salaryRecords.bonuses.bonusType',

            'salaryRecords.deductions.deductionType',

            'salaryRecords.loanInstallments.employeeLoan.loanType',

        ])->findOrFail($id);



        return response()->json($payroll);

    }



    public function destroy($id)

    {

        Payroll::destroy($id);



        return response()->json(['message' => 'Deleted successfully']);

    }



    public function generate($id)

    {

        $payroll = Payroll::findOrFail($id);



        DB::transaction(function () use ($payroll) {

            foreach (Employee::query()->orderBy('name')->get() as $employee) {

                $record = SalaryRecord::firstOrCreate(

                    ['payroll_id' => $payroll->id, 'employee_id' => $employee->id],

                    [

                        'basic_salary' => $employee->basic_salary ?? 0,

                        'status' => 'draft',

                    ]

                );



                foreach ($employee->activeLoans()->get() as $loan) {

                    $existing = LoanInstallment::query()

                        ->where('salary_record_id', $record->id)

                        ->where('employee_loan_id', $loan->id)

                        ->exists();



                    if ($existing) {

                        continue;

                    }



                    $balance = (float) $loan->balance_remaining;

                    if ($balance <= 0) {

                        continue;

                    }



                    $amount = min((float) $loan->installment_amount, $balance);

                    if ($amount <= 0) {

                        continue;

                    }



                    $newBalance = round($balance - $amount, 2);



                    LoanInstallment::create([

                        'salary_record_id' => $record->id,

                        'employee_loan_id' => $loan->id,

                        'amount' => round($amount, 2),

                        'remaining_balance' => max(0, $newBalance),

                    ]);



                    $loan->balance_remaining = max(0, $newBalance);

                    $loan->remaining_balance = max(0, $newBalance);

                    if ($loan->balance_remaining <= 0) {

                        $loan->is_active = false;

                    }

                    $loan->save();

                }



                $this->calculator->recalculate($record);

            }



            $payroll->update([

                'generated_at' => now(),

                'status' => 'draft',

            ]);

        });



        return $this->show($payroll->id);

    }



    public function recalculatePayroll($id)

    {

        $payroll = Payroll::findOrFail($id);

        foreach ($payroll->salaryRecords as $record) {

            $this->calculator->recalculate($record);

        }



        return $this->show($payroll->id);

    }



    public function recalculateSalaryRecord($recordId)

    {

        $record = SalaryRecord::findOrFail($recordId);

        $this->calculator->recalculate($record);



        return response()->json($record->fresh([

            'employee',

            'payroll',

            'allowances.allowanceType',

            'bonuses.bonusType',

            'deductions.deductionType',

            'loanInstallments.employeeLoan',

        ]));

    }



    public function updateSalaryRecord(Request $request, $recordId)

    {

        $record = SalaryRecord::findOrFail($recordId);

        $validated = $request->validate([

            'payment_date' => 'nullable|date',

            'payment_method' => 'nullable|string|max:100',

            'status' => 'nullable|string|max:50',

        ]);



        $record->update($validated);



        return response()->json($record->fresh(['employee', 'payroll']));

    }



    public function storeAllowance(Request $request, $recordId)

    {

        return $this->storeLineItem($request, $recordId, Allowance::class, AllowanceType::class, 'allowance_type_id', 'allowance_name');

    }



    public function storeBonus(Request $request, $recordId)

    {

        return $this->storeLineItem($request, $recordId, Bonus::class, BonusType::class, 'bonus_type_id', 'bonus_name');

    }



    public function storeDeduction(Request $request, $recordId)

    {

        return $this->storeLineItem($request, $recordId, Deduction::class, DeductionType::class, 'deduction_type_id', 'deduction_name');

    }



    private function storeLineItem(

        Request $request,

        $recordId,

        string $modelClass,

        string $typeClass,

        string $typeFk,

        string $typeNameField

    ) {

        $record = SalaryRecord::findOrFail($recordId);

        $validated = $request->validate([

            'title' => 'nullable|string|max:255',

            'amount' => 'required|numeric|min:0',

            $typeFk => 'nullable|integer|exists:'.(new $typeClass)->getTable().',id',

        ]);



        $title = $validated['title'] ?? null;

        if (! $title && ! empty($validated[$typeFk])) {

            $type = $typeClass::find($validated[$typeFk]);

            $title = $type?->{$typeNameField} ?? 'Line item';

        }

        if (! $title) {

            $title = 'Line item';

        }



        $item = $modelClass::create([

            'salary_record_id' => $record->id,

            $typeFk => $validated[$typeFk] ?? null,

            'title' => $title,

            'amount' => $validated['amount'],

        ]);



        $this->calculator->recalculate($record);

        $relation = match ($typeFk) {
            'allowance_type_id' => 'allowanceType',
            'bonus_type_id' => 'bonusType',
            'deduction_type_id' => 'deductionType',
            default => null,
        };

        return response()->json($relation ? $item->load($relation) : $item, 201);

    }



    public function destroyAllowance($id)

    {

        return $this->destroyLineItem($id, Allowance::class);

    }



    public function destroyBonus($id)

    {

        return $this->destroyLineItem($id, Bonus::class);

    }



    public function destroyDeduction($id)

    {

        return $this->destroyLineItem($id, Deduction::class);

    }



    private function destroyLineItem($id, string $modelClass)

    {

        $item = $modelClass::findOrFail($id);

        $record = $item->salaryRecord;

        $item->delete();

        $this->calculator->recalculate($record);



        return response()->json(['message' => 'Deleted successfully']);

    }

}

