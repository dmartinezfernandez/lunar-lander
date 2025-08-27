import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function IntArrayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value: string = control.value;
        if (!value) {
            return null; // don't validate empty, use Validators.required separately
        }

        // Split by commas and validate each part as number.
        for (const part of value.split(',')) {
            const num = Number(part);

            if (Number.isNaN(num) || !(num >= 8 && num <= 200 || num === 0)) {
                return { intArray: true }; // invalid
            }
        }

        return null; // valid
    };
}