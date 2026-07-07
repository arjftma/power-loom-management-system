<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Admin (users)
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('phone_no', 20)->nullable()->after('email');
            $table->string('cnic', 15)->nullable()->after('phone_no');
            $table->text('address')->nullable()->after('cnic');
            $table->string('role')->default('admin')->after('address');
            $table->string('status')->default('active')->after('role');
        });
        foreach (DB::table('users')->whereNull('username')->get(['id', 'email']) as $user) {
            DB::table('users')->where('id', $user->id)->update(['username' => $user->email]);
        }

        // Employee
        Schema::table('employees', function (Blueprint $table) {
            $table->string('father_name')->nullable()->after('name');
            $table->string('designation')->nullable()->after('role');
            $table->string('department')->nullable()->after('designation');
            $table->date('joining_date')->nullable()->after('department');
            $table->string('employment_type')->nullable()->after('joining_date');
            $table->string('status')->default('active')->after('basic_salary');
        });
        if (Schema::hasColumn('employees', 'role')) {
            DB::table('employees')->whereNull('designation')->update([
                'designation' => DB::raw('role'),
            ]);
        }

        // Supplier
        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('name');
            $table->string('contact_person_name')->nullable()->after('company_name');
            $table->string('contact_person_phone', 20)->nullable()->after('contact_person_name');
            $table->string('office_phone', 20)->nullable()->after('contact_person_phone');
            $table->string('cnic_or_ntn', 20)->nullable()->after('email');
            $table->string('supplied_material_type')->nullable()->after('cnic_or_ntn');
            $table->string('status')->default('active')->after('supplied_material_type');
        });
        DB::table('suppliers')->update(['company_name' => DB::raw('name')]);
        if (Schema::hasColumn('suppliers', 'materials_supplied')) {
            DB::table('suppliers')->whereNull('supplied_material_type')->update([
                'supplied_material_type' => DB::raw('materials_supplied'),
            ]);
        }
        if (Schema::hasColumn('suppliers', 'phone')) {
            DB::table('suppliers')->whereNull('office_phone')->update([
                'office_phone' => DB::raw('phone'),
            ]);
        }
        if (Schema::hasColumn('suppliers', 'cnic')) {
            DB::table('suppliers')->whereNull('cnic_or_ntn')->update([
                'cnic_or_ntn' => DB::raw('cnic'),
            ]);
        }

        // Customer
        Schema::table('customers', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('name');
            $table->string('company_name')->nullable()->after('customer_name');
            $table->string('cnic_or_ntn', 20)->nullable()->after('email');
            $table->string('customer_type')->nullable()->after('cnic_or_ntn');
            $table->decimal('credit_limit', 12, 2)->default(0)->after('customer_type');
            $table->string('status')->default('active')->after('credit_limit');
        });
        DB::table('customers')->update(['customer_name' => DB::raw('name')]);
        if (Schema::hasColumn('customers', 'cnic')) {
            DB::table('customers')->whereNull('cnic_or_ntn')->update([
                'cnic_or_ntn' => DB::raw('cnic'),
            ]);
        }

        // Fabric production
        Schema::table('production_batches', function (Blueprint $table) {
            $table->foreignId('employee_id')->nullable()->after('fabric_type')->constrained()->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->after('employee_id')->constrained()->nullOnDelete();
            $table->string('unit', 20)->default('m')->after('meters_produced');
            $table->string('quality_grade')->nullable()->after('unit');
            $table->text('remarks')->nullable()->after('quality_grade');
        });

        // Fabric dispatch
        Schema::table('dispatches', function (Blueprint $table) {
            $table->string('unit', 20)->default('m')->after('quantity');
            $table->string('vehicle_no')->nullable()->after('unit');
            $table->string('dispatch_challan_no')->nullable()->after('vehicle_no');
            $table->string('received_by')->nullable()->after('dispatch_challan_no');
            $table->text('remarks')->nullable()->after('received_by');
        });

        // Payroll row per employee (salary_records ↔ Payroll)
        if (Schema::hasTable('salary_records')) {
            Schema::table('salary_records', function (Blueprint $table) {
                $table->decimal('gross_salary', 12, 2)->default(0)->after('basic_salary');
                $table->date('payment_date')->nullable()->after('net_salary');
                $table->string('payment_method')->nullable()->after('payment_date');
                $table->string('status')->default('draft')->after('payment_method');
            });
        }

        if (Schema::hasTable('employee_loans')) {
            Schema::table('employee_loans', function (Blueprint $table) {
                $table->decimal('remaining_balance', 12, 2)->nullable()->after('balance_remaining');
            });
            DB::table('employee_loans')->update([
                'remaining_balance' => DB::raw('balance_remaining'),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'phone_no', 'cnic', 'address', 'role', 'status']);
        });
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['father_name', 'designation', 'department', 'joining_date', 'employment_type', 'status']);
        });
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn([
                'company_name', 'contact_person_name', 'contact_person_phone', 'office_phone',
                'cnic_or_ntn', 'supplied_material_type', 'status',
            ]);
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'company_name', 'cnic_or_ntn', 'customer_type', 'credit_limit', 'status']);
        });
        Schema::table('production_batches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('employee_id');
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropColumn(['unit', 'quality_grade', 'remarks']);
        });
        Schema::table('dispatches', function (Blueprint $table) {
            $table->dropColumn(['unit', 'vehicle_no', 'dispatch_challan_no', 'received_by', 'remarks']);
        });
        if (Schema::hasTable('salary_records')) {
            Schema::table('salary_records', function (Blueprint $table) {
                $table->dropColumn(['gross_salary', 'payment_date', 'payment_method', 'status']);
            });
        }
        if (Schema::hasTable('employee_loans')) {
            Schema::table('employee_loans', function (Blueprint $table) {
                $table->dropColumn('remaining_balance');
            });
        }
    }
};
