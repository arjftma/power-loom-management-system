<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'username' => 'admin',
                'password' => bcrypt('11221122'),
                'phone_no' => null,
                'cnic' => null,
                'address' => null,
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        User::where('email', 'admin@admin.com')->delete();

        $this->call(PayrollTypeSeeder::class);
    }
}
