<?php

namespace App\Http\Concerns;

trait MapsErdEntityInput
{
    protected function blankToNull(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return trim((string) $value);
    }

    /** Employee: accept ERD + legacy keys. */
    protected function mapEmployeeInput(array $data): array
    {
        if (isset($data['full_name']) && ! isset($data['name'])) {
            $data['name'] = $data['full_name'];
        }
        if (isset($data['phone_no']) && ! isset($data['phone'])) {
            $data['phone'] = $data['phone_no'];
        }
        if (isset($data['designation']) && ! isset($data['role'])) {
            $data['role'] = strtolower((string) $data['designation']);
        }
        foreach (['name', 'father_name', 'cnic', 'phone', 'address', 'email', 'department', 'employment_type', 'status'] as $k) {
            if (array_key_exists($k, $data)) {
                $data[$k] = $this->blankToNull($data[$k]);
            }
        }
        if (isset($data['role']) && is_string($data['role'])) {
            $data['role'] = strtolower(trim($data['role']));
        }
        if (array_key_exists('basic_salary', $data) && $data['basic_salary'] !== null && $data['basic_salary'] !== '') {
            $data['basic_salary'] = round((float) $data['basic_salary'], 2);
        }

        return $data;
    }

    protected function mapSupplierInput(array $data): array
    {
        if (isset($data['company_name']) && ! isset($data['name'])) {
            $data['name'] = $data['company_name'];
        }
        if (isset($data['supplied_material_type']) && ! isset($data['materials_supplied'])) {
            $data['materials_supplied'] = $data['supplied_material_type'];
        }
        if (isset($data['office_phone']) && ! isset($data['phone'])) {
            $data['phone'] = $data['office_phone'];
        }
        foreach ([
            'name', 'company_name', 'contact_person_name', 'contact_person_phone', 'office_phone',
            'phone', 'email', 'address', 'cnic_or_ntn', 'materials_supplied', 'supplied_material_type', 'status',
        ] as $k) {
            if (array_key_exists($k, $data)) {
                $data[$k] = $this->blankToNull($data[$k]);
            }
        }
        if (! empty($data['company_name']) && empty($data['name'])) {
            $data['name'] = $data['company_name'];
        }
        if (! empty($data['supplied_material_type']) && empty($data['materials_supplied'])) {
            $data['materials_supplied'] = $data['supplied_material_type'];
        }
        if (! empty($data['office_phone']) && empty($data['phone'])) {
            $data['phone'] = $data['office_phone'];
        }

        return $data;
    }

    protected function mapCustomerInput(array $data): array
    {
        if (isset($data['customer_name']) && ! isset($data['name'])) {
            $data['name'] = $data['customer_name'];
        }
        if (isset($data['phone_no']) && ! isset($data['phone'])) {
            $data['phone'] = $data['phone_no'];
        }
        foreach ([
            'name', 'customer_name', 'company_name', 'phone', 'email', 'address',
            'cnic_or_ntn', 'customer_type', 'status',
        ] as $k) {
            if (array_key_exists($k, $data)) {
                $data[$k] = $this->blankToNull($data[$k]);
            }
        }
        if (! empty($data['customer_name']) && empty($data['name'])) {
            $data['name'] = $data['customer_name'];
        }
        if (array_key_exists('credit_limit', $data) && $data['credit_limit'] !== null && $data['credit_limit'] !== '') {
            $data['credit_limit'] = round((float) $data['credit_limit'], 2);
        }

        return $data;
    }

    protected function mapProductionInput(array $data): array
    {
        if (isset($data['production_date']) && ! isset($data['date'])) {
            $data['date'] = $data['production_date'];
        }
        if (isset($data['loom_no']) && ! isset($data['loom_number'])) {
            $data['loom_number'] = $data['loom_no'];
        }
        if (isset($data['quantity_produced']) && ! isset($data['meters_produced'])) {
            $data['meters_produced'] = $data['quantity_produced'];
        }
        if (empty($data['unit'])) {
            $data['unit'] = 'm';
        }

        return $data;
    }

    protected function mapDispatchInput(array $data): array
    {
        if (isset($data['dispatch_date']) && ! isset($data['date'])) {
            $data['date'] = $data['dispatch_date'];
        }
        if (isset($data['quantity_dispatched']) && ! isset($data['quantity'])) {
            $data['quantity'] = $data['quantity_dispatched'];
        }
        if (empty($data['unit'])) {
            $data['unit'] = 'm';
        }

        return $data;
    }
}
