<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BonusType extends Model
{
    protected $fillable = ['bonus_name', 'description', 'status'];
}
