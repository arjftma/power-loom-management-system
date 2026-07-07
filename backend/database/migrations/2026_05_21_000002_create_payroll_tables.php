<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->string('title')->nullable();
            $table->enum('status', ['draft', 'finalized'])->default('draft');
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
            $table->unique(['year', 'month']);
        });

        Schema::create('salary_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('total_allowances', 12, 2)->default(0);
            $table->decimal('total_bonuses', 12, 2)->default(0);
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('total_loan_installments', 12, 2)->default(0);
            $table->decimal('net_salary', 12, 2)->default(0);
            $table->timestamps();
            $table->unique(['payroll_id', 'employee_id']);
        });

        Schema::create('allowances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_record_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('amount', 12, 2);
            $table->timestamps();
        });

        Schema::create('bonuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_record_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('amount', 12, 2);
            $table->timestamps();
        });

        Schema::create('deductions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_record_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('amount', 12, 2);
            $table->timestamps();
        });

        Schema::create('employee_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->decimal('principal_amount', 12, 2);
            $table->decimal('balance_remaining', 12, 2);
            $table->decimal('installment_amount', 12, 2);
            $table->date('start_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('loan_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_loan_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_installments');
        Schema::dropIfExists('employee_loans');
        Schema::dropIfExists('deductions');
        Schema::dropIfExists('bonuses');
        Schema::dropIfExists('allowances');
        Schema::dropIfExists('salary_records');
        Schema::dropIfExists('payrolls');
    }
};
