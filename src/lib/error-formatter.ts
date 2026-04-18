/**
 * Formats API validation errors into user-friendly messages.
 * Handles NestJS/Class-Validator array messages and raw strings.
 */
export const formatApiError = (message: any): string => {
    if (!message) return 'An unexpected error occurred';

    // Handle array of messages (standard for NestJS validation)
    if (Array.isArray(message)) {
        // Format each message and join them
        return message
            .map(msg => formatSingleErrorMessage(msg))
            .filter((msg, index, self) => self.indexOf(msg) === index) // Unique messages
            .join('. ');
    }

    // Handle single string message
    if (typeof message === 'string') {
        const technicalPatterns = [
            /request failed with status code/i,
            /network error/i,
            /bad gateway/i,
            /gateway timeout/i,
            /internal server error/i,
            /error \d{3}/i
        ];

        if (technicalPatterns.some(pattern => pattern.test(message))) {
            return 'The clinical request could not be processed. Please verify your details or try again shortly.';
        }

        return formatSingleErrorMessage(message);
    }

    return 'An unexpected communication error occurred. Please try again.';
};

/**
 * Clean up a single error message:
 * - Removes field prefixes like "businessRegNumber: "
 * - Converts camelCase to readable text
 * - Capitalizes first letter
 */
const formatSingleErrorMessage = (msg: string): string => {
    if (typeof msg !== 'string') return String(msg);

    // Common technical validation phrases -> user-friendly ones
    const mappings: Record<string, string> = {
        'should not be empty': 'is required',
        'must be a string': 'is invalid',
        'must be an email': 'must be a valid email',
        'must be a number': 'must be a valid number',
        'must be a boolean': 'must be a valid boolean',
        'must be an array': 'is invalid',
        'must be a UUID': 'is invalid',
        'must be a date': 'must be a valid date',
        'must be shorter than or equal to': 'is too long (max',
        'must be longer than or equal to': 'is too short (min',
        'must be one of the following values': 'must be a valid type',
        'must be a valid ISO 8601 date string': 'must be a valid date',
        'must match regular expression': 'is invalid',
        'must be an instance of': 'is invalid',
        'must be a valid phone number': 'must be a valid phone number',
    };

    let field = '';
    let errorPart = msg;

    // Handle NestJS/Class-Validator format "field: error message"
    if (msg.includes(':')) {
        const parts = msg.split(':');
        field = parts[0].trim();
        errorPart = parts[1].trim();
    } else {
        // Sometimes the message is just "field should satisfy X"
        // Try to extract the first word as field if it's camelCase
        const firstWord = msg.split(' ')[0];
        if (/[a-z]+[A-Z]/.test(firstWord)) {
            field = firstWord;
            errorPart = msg.slice(firstWord.length).trim();
        }
    }

    const readableField = field ? formatFieldName(field) : '';
    let cleanError = errorPart;

    // Apply mappings to the error part
    Object.entries(mappings).forEach(([tech, human]) => {
        if (cleanError.includes(tech)) {
            cleanError = cleanError.replace(new RegExp(tech, 'gi'), human);
        }
    });

    // If the error part still contains the raw field name, replace it with readableField or remove it
    if (field && cleanError.toLowerCase().includes(field.toLowerCase())) {
        if (readableField) {
            cleanError = cleanError.replace(new RegExp(field, 'gi'), readableField);
        } else {
            // If no readable field found yet, use this one
            const extractedField = cleanError.match(new RegExp(field, 'i'))?.[0];
            if (extractedField) {
                field = extractedField;
            }
            cleanError = cleanError.replace(new RegExp(field, 'gi'), '').trim();
        }
    }

    // Combine readable field and error if they are not already joined
    let finalMsg = '';
    if (readableField) {
        // If the error starts with the readable field name, don't prepend it again
        if (cleanError.trim().startsWith(readableField)) {
            finalMsg = cleanError;
        } else {
            finalMsg = `${readableField} ${cleanError}`;
        }
    } else {
        finalMsg = cleanError;
    }

    // Remove double spaces and clean up
    finalMsg = finalMsg.replace(/\s+/g, ' ').trim();

    // Deduplicate common issues (e.g. "is required. is invalid")
    if (finalMsg.includes('is required') && finalMsg.includes('is invalid')) {
        finalMsg = finalMsg.split(',')[0].trim(); // Take the first one if multiple
    }

    // Capitalize first letter
    finalMsg = finalMsg.charAt(0).toUpperCase() + finalMsg.slice(1);

    // Final cleanup of punctuation
    if (finalMsg.length > 5 && !finalMsg.endsWith('.') && !finalMsg.endsWith('!') && !finalMsg.endsWith('?')) {
        finalMsg += '.';
    }

    return finalMsg;
};

/**
 * Converts camelCase to Space Separated Words
 */
const formatFieldName = (name: string): string => {
    return name
        .replace(/([A-Z])/g, ' $1') // insert a space before all caps
        .replace(/^./, (str) => str.toUpperCase()) // capitalize the first letter
        .replace('Url', ' URL')
        .replace('Doc', ' Document')
        .replace('Reg ', ' Registration ')
        .trim();
};
