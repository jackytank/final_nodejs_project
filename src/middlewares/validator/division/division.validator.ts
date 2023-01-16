/* eslint-disable @typescript-eslint/ban-types */
import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import _ from "lodash";
import eastasianwidth from "../../../utils/eastasianwidth";

// message: messages.ECL010('Division Leader')

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

export function CustomIsStringNumber(validationOptions: ValidationOptions){
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'customIsStringNumber',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    const parsedVal = +(value as string) // convert string to number
                    if(isNaN(parsedVal) || parsedVal < 0){
                        // if return NaN meaning can't convert to number
                        return false;
                    }
                    return true;
                },
            }
        })
    }
}
