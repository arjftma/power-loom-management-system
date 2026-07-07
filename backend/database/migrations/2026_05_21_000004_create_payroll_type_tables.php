<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('allowance_types', function (Blueprint $table) {
            $table->id();
            $table->string('allowance_name');
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('bonus_types', function (Blueprint $table) {
            $table->id();
            $table->string('bonus_name');
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('deduction_types', function (Blueprint $table) {
            $table->id();
            $table->string('deduction_name');
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('loan_types', function (Blueprint $table) {
            $table->id();
            $table->string('loan_name');
            $table->decimal('interest_rate', 5, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('employee_allowances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('allowance_type_id')->constrained()->cascadeOnDelete();
            $table->decimal('default_amount', 12, 2)->default(0);
            $table->string('status')->default('active');
            $table->timestamps();
            $table->unique(['employee_id', 'allowance_type_id']);
        });

        if (Schema::hasTable('allowances')) {
            Schema::table('allowances', function (Blueprint $table) {
                $table->foreignId('allowance_type_id')->nullable()->after('salary_record_id')->constrained()->nullOnDelete();
            });
        }
        if (Schema::hasTable('bonuses')) {
            Schema::table('bonuses', function (Blueprint $table) {
                $table->foreignId('bonus_type_id')->nullable()->after('salary_record_id')->constrained()->nullOnDelete();
            });
        }
        if (Schema::hasTable('deductions')) {
            Schema::table('deductions', function (Blueprint $table) {
                $table->foreignId('deduction_type_id')->nullable()->after('salary_record_id')->constrained()->nullOnDelete();
            });
        }
        if (Schema::hasTable('employee_loans')) {
            Schema::table('employee_loans', function (Blueprint $table) {
                $table->foreignId('loan_type_id')->nullable()->after('employee_id')->constrained()->nullOnDelete();
            });
        }
        if (Schema::hasTable('loan_installments')) {
            Schema::table('loan_installments', function (Blueprint $table) {
                $table->decimal('remaining_balance', 12, 2)->nullable()->after('amount');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('loan_installments')) {
            Schema::table('loan_installments', function (Blueprint $table) {
                $table->dropColumn('remaining_balance');
            });
        }
        if (Schema::hasTable('employee_loans')) {
            Schema::table('employee_loans', function (Blueprint $table) {
                $table->dropConstrainedForeignId('loan_type_id');
            });
        }
        if (Schema::hasTable('deductions')) {
            Schema::table('deductions', function (Blueprint $table) {
                $table->dropConstrainedForeignId('deduction_type_id');
            });
        }
        if (Schema::hasTable('bonuses')) {
            Schema::table('bonuses', function (Blueprint $table) {
                $table->dropConstrainedForeignId('bonus_type_id');
            });
        }
        if (Schema::hasTable('allowances')) {
            Schema::table('allowances', function (Blueprint $table) {
                $table->dropConstrainedForeignId('allowance_type_id');
            });
        }
        Schema::dropIfExists('employee_allowances');
        Schema::dropIfExists('loan_types');
        Schema::dropIfExists('deduction_types');
        Schema::dropIfExists('bonus_types');
        Schema::dropIfExists('allowance_types');
    }
};
