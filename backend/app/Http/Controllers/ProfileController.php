<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required_without:full_name|string|max:255',
            'full_name' => 'required_without:name|string|max:255',
            'username' => 'nullable|string|max:255|unique:users,username,'.$user->id,
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'phone_no' => 'nullable|string|max:20',
            'cnic' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:2000',
            'role' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
        ]);

        $user->name = $validated['name'] ?? $validated['full_name'];
        $user->email = $validated['email'];
        $user->username = $validated['username'] ?? $user->username ?? $user->email;
        $user->phone_no = $validated['phone_no'] ?? null;
        $user->cnic = $validated['cnic'] ?? null;
        $user->address = $validated['address'] ?? null;
        if (isset($validated['role'])) {
            $user->role = $validated['role'];
        }
        if (isset($validated['status'])) {
            $user->status = $validated['status'];
        }
        $user->save();

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }
}
