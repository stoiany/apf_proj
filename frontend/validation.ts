import { ValidationSchema } from "./types.ts";

export interface ValidationResult {
    isValid : boolean;
    errors: Record<string, string>;
}

export function validateData(data: Record<string, any>, schema: ValidationSchema) : ValidationResult {
    const errors: Record<string, string> = {};
    let isValid = true;

    for(const field in schema){
        const rules = schema[field];
        const value = data[field];

        if(rules.required?.value){
            if(value === undefined || value === null || String(value).trim() === ""){
                errors[field] = rules.required.message;
                isValid = false;
                continue;
            }
        }

        const stringValue = String(value || "").trim();
        if(stringValue === ""){
            continue;
        }

        if(rules.maxLength && String(value).length > rules.maxLength.value){
            errors[field] = rules.maxLength.message;
            isValid = false;
            continue;
        }

        if(rules.minLength && String(value).length < rules.minLength.value){
            errors[field] = rules.minLength.message;
            isValid = false;
        }
    }

    return { isValid, errors };
}