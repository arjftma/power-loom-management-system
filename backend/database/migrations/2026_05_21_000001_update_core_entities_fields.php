<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('cnic', 15)->nullable()->after('name');
            $table->string('phone', 20)->nullable()->after('cnic');
            $table->string('address', 500)->nullable()->after('phone');
            $table->string('email')->nullable()->after('address');
            $table->decimal('basic_salary', 12, 2)->default(0)->after('role');
        });

        if (Schema::hasColumn('employees', 'contact_info')) {
            DB::table('employees')->whereNotNull('contact_info')->update([
                'phone' => DB::raw('contact_info'),
            ]);
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('contact_info');
            });
        }

        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('cnic', 15)->nullable()->after('name');
            $table->string('phone', 20)->nullable()->after('cnic');
            $table->string('address', 500)->nullable()->after('phone');
            $table->string('email')->nullable()->after('address');
        });

        if (Schema::hasColumn('suppliers', 'contact_info')) {
            DB::table('suppliers')->whereNotNull('contact_info')->update([
                'phone' => DB::raw('contact_info'),
            ]);
            Schema::table('suppliers', function (Blueprint $table) {
                $table->dropColumn('contact_info');
            });
        }

        Schema::table('customers', function (Blueprint $table) {
            $table->string('cnic', 15)->nullable()->after('name');
            $table->string('email')->nullable()->after('address');
        });

        if (Schema::hasColumn('customers', 'contact') && ! Schema::hasColumn('customers', 'phone')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->renameColumn('contact', 'phone');
            });
        } elseif (! Schema::hasColumn('customers', 'phone')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->string('phone', 20)->nullable()->after('cnic');
            });
        }
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('contact_info')->nullable();
            $table->dropColumn(['cnic', 'phone', 'address', 'email', 'basic_salary']);
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('contact_info')->nullable();
            $table->dropColumn(['cnic', 'phone', 'address', 'email']);
        });

        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'phone')) {
                $table->renameColumn('phone', 'contact');
            }
            $table->dropColumn(['cnic', 'email']);
        });
    }
};
