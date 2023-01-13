/* eslint-disable @typescript-eslint/ban-types */
import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import eastasianwidth from "../../../utils/eastasianwidth";


/**
 * Custom 'class-validator' decorator return true if string contains only 1-byte/half-width char, return false otherwise
 */
export function IsAll1Bytes(validationOptions: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isAll1Bytes',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (eastasianwidth.isStringContainsFullWidth(value)) {
                        return false;
                    }
                    return true;
                },
            }
        });
    };
}