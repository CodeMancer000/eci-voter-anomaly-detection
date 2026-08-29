/**
 * Normalization Engine for Electoral Name & Text Standardization
 * Ensures robust comparison across whitespace, casing, and punctuation variations.
 */

export function normalizeText(input: string | null | undefined): string {
    if (!input) return "";

    return input
        .toLowerCase()
        .trim()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()"'`]/g, "") // Remove harmless punctuation
        .replace(/\s+/g, " "); // Collapse multiple consecutive spaces
}

export function normalizeName(name: string | null | undefined): string {
    return normalizeText(name);
}

/**
 * Check if a string contains malformed/suspicious patterns:
 * - numeric-only or excessive numbers mixed with symbols
 * - excessive symbols (e.g. Rahul@@123)
 * - repetitive characters or corrupted patterns (e.g. 0.3asder)
 */
export function isSuspiciousName(name: string): { isSuspicious: boolean; reason?: string } {
    if (!name || name.trim().length < 2) {
        return { isSuspicious: true, reason: "Name string is empty or under 2 characters." };
    }

    const trimmed = name.trim();

    // Numeric only or starting with numbers (e.g. "0.3asder", "12345")
    if (/^[0-9]/.test(trimmed)) {
        return { isSuspicious: true, reason: `Malformed string starts with numbers ("${trimmed}").` };
    }

    // Contains symbols like @, #, $, %, ^, &, *, etc.
    if (/[@#$%^&*()_+=\[\]{};:"\\|<>?/~`]/.test(trimmed)) {
        return { isSuspicious: true, reason: `Contains invalid special symbols ("${trimmed}").` };
    }

    // Numeric content exceeding 20%
    const digits = (trimmed.match(/[0-9]/g) || []).length;
    if (digits > 0 && digits / trimmed.length > 0.2) {
        return { isSuspicious: true, reason: `High concentration of numeric characters ("${trimmed}").` };
    }

    // Extremely repetitive character patterns (e.g., "aaaaa")
    if (/(.)\1{4,}/i.test(trimmed)) {
        return { isSuspicious: true, reason: `Excessive repetitive characters ("${trimmed}").` };
    }

    return { isSuspicious: false };
}
