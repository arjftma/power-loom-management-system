<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PayrollTypeSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['allowance_name' => 'House Rent', 'description' => 'Monthly house rent allowance'],
            ['allowance_name' => 'Transport', 'description' => 'Travel / fuel allowance'],
            ['allowance_name' => 'Medical', 'description' => 'Medical reimbursement allowance'],
        ] as $row) {
            DB::table('allowance_types')->updateOrInsert(
                ['allowance_name' => $row['allowance_name']],
                ['description' => $row['description'], 'status' => 'active', 'created_at' => now(), 'updated_at' => now()]
            );
        }

        foreach ([
            ['bonus_name' => 'Festival Bonus', 'description' => 'Eid / festival bonus'],
            ['bonus_name' => 'Performance Bonus', 'description' => 'Performance incentive'],
        ] as $row) {
            DB::table('bonus_types')->updateOrInsert(
                ['bonus_name' => $row['bonus_name']],
                ['description' => $row['description'], 'status' => 'active', 'created_at' => now(), 'updated_at' => now()]
            );
        }

        foreach ([
            ['deduction_name' => 'Income Tax', 'description' => 'Tax deduction'],
            ['deduction_name' => 'Provident Fund', 'description' => 'PF contribution'],
            ['deduction_name' => 'Absence', 'description' => 'Unpaid leave / absence'],
        ] as $row) {
            DB::table('deduction_types')->updateOrInsert(
                ['deduction_name' => $row['deduction_name']],
                ['description' => $row['description'], 'status' => 'active', 'created_at' => now(), 'updated_at' => now()]
            );
        }

        foreach ([
            ['loan_name' => 'Salary Advance', 'interest_rate' => 0, 'description' => 'Advance against salary'],
            ['loan_name' => 'Personal Loan', 'interest_rate' => 5, 'description' => 'Short-term personal loan'],
        ] as $row) {
            DB::table('loan_types')->updateOrInsert(
                ['loan_name' => $row['loan_name']],
                [
                    'interest_rate' => $row['interest_rate'],
                    'description' => $row['description'],
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
