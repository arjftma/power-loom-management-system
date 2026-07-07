<?php

namespace App\Http\Concerns;

trait NormalizesApiInput
{
    /**
     * Turn empty string / invalid values into null for optional foreign keys.
     */
    protected function nullableForeignKey(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (! is_numeric($value)) {
            return null;
        }

        $id = (int) $value;

        return $id > 0 ? $id : null;
    }
}
