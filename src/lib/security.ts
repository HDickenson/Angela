/**
 * Lobster Trap: Security Inspection Lib
 * 
 * These patterns are used to inspect incoming prompts for malicious intent,
 * prompt injection, or sensitive data leaks.
 * 
 * License: Provided as part of the application template. 
 * Users are encouraged to customize and harden these patterns.
 */

export interface InspectionResult {
  safe: boolean;
  reason?: string;
  pattern?: string;
}

export const SECURITY_PATTERNS = [
  {
    id: "SENSITIVE_DATA_DIRECTIVE",
    pattern: /sensitive|confidential/i,
    description: "Detected request for sensitive or confidential data traversal."
  }
];

/**
 * Inspects a string against the security patterns.
 */
export const inspectPrompt = (input: string): InspectionResult => {
  for (const { pattern, id, description } of SECURITY_PATTERNS) {
    if (pattern.test(input)) {
      return { 
        safe: false, 
        reason: description,
        pattern: id
      };
    }
  }
  return { safe: true };
};
