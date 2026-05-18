/**
 * Lobster Trap: Security Inspection Lib
 *
 * NOTE: This is a heuristic pattern-matching layer, not a cryptographic security
 * guarantee. It reduces obvious attack surface but should be combined with
 * server-side authorization, input sanitization, and audit logging in production.
 *
 * Covers the "Dirty Dozen" threat vectors required for hackathon compliance.
 */

export interface InspectionResult {
  safe: boolean;
  reason?: string;
  pattern?: string;
}

/**
 * Normalize input before pattern testing to defeat mixed-case and whitespace
 * obfuscation (e.g. "  Ignore   ALL  Rules  " -> "ignore all rules").
 */
const normalize = (input: string): string =>
  input.toLowerCase().replace(/\s+/g, " ").trim();

export const SECURITY_PATTERNS = [
  // 1. PROMPT_INJECTION
  // Matches: "ignore [anything] rules/instructions", "override [anything] rules/instructions",
  // "disregard previous"
  {
    id: "PROMPT_INJECTION",
    pattern: /(ignore|override)\s+\S+(\s+\S+)?\s+(rules|instructions)|disregard previous/,
    description: "Detected prompt injection attempt (ignore/override rules or instructions)."
  },

  // 3. SYSTEM_PROMPT_EXFIL
  {
    id: "SYSTEM_PROMPT_EXFIL",
    pattern: /system prompt|your instructions|tell me your prompt|repeat your rules|what are your rules/,
    description: "Detected attempt to exfiltrate system prompt or internal instructions."
  },

  // 4. IDENTITY_OVERRIDE
  // Matches: "forget your identity/rules", "become a hacker", "act as [anything] hacker/admin",
  // "pretend you are"
  {
    id: "IDENTITY_OVERRIDE",
    pattern: /forget your (identity|rules)|become a hacker|act as \S+\s+(hacker|admin)|pretend you are/,
    description: "Detected attempt to override assistant identity or role."
  },

  // 5. CREDENTIAL_FISHING
  // api_key/api key/secret key/gemini key/bearer token standalone, OR
  // password only when adjacent to reveal-intent verbs (not "password policy" etc.)
  {
    id: "CREDENTIAL_FISHING",
    pattern: /\b(api[_ ]key|secret[_ ]key|gemini[_ ]api[_ ]key|gemini\s+key|bearer\s+token)\b|(show|what is|reveal|give me)(\s+\w+)?\s+password/,
    description: "Detected attempt to extract credentials, API keys, or secrets."
  },

  // 6. SQL_INJECTION
  {
    id: "SQL_INJECTION",
    pattern: /drop\s+table|delete\s+from|select\s+\*\s+from|union\s+select|--\s|;\s*drop/,
    description: "Detected SQL injection pattern."
  },

  // 7. BYPASS_DIRECTIVE
  {
    id: "BYPASS_DIRECTIVE",
    pattern: /bypass\s+(security|check|filter|access)|skip\s+(security|auth)/,
    description: "Detected attempt to bypass security controls."
  },

  // 8. RESTRICTED_TRAVERSAL
  {
    id: "RESTRICTED_TRAVERSAL",
    pattern: /restricted\s+(database|folder|zone|data)|audit logs with pii|tenant isolation/,
    description: "Detected attempt to access restricted data zones or audit logs with PII."
  },

  // 9. SCOPE_EXPANSION
  // "diagnose all", "access all", "show all evidence/records/logs", "run as admin"
  // Deliberately avoids "diagnose the" / "diagnose [specific thing]" to prevent false positives.
  {
    id: "SCOPE_EXPANSION",
    pattern: /\bdiagnose all\b|access all\b|show all (evidence|records|logs)\b|run as admin\b/,
    description: "Detected attempt to expand scope or run with elevated privileges."
  },

  // 10. COMMAND_INJECTION
  // eval(, exec(, __proto__, process.env, require( in suspicious (non-code-review) context
  {
    id: "COMMAND_INJECTION",
    pattern: /\beval\s*\(|exec\s*\(|__proto__|process\.env|require\s*\(/,
    description: "Detected command injection or prototype pollution pattern."
  }
];

/**
 * Inspects a prompt string against the Lobster Trap security patterns.
 * Input is normalized (lowercased, whitespace-collapsed) before testing.
 * Returns the first matching violation, or { safe: true } if none match.
 */
export const inspectPrompt = (input: string): InspectionResult => {
  const normalized = normalize(input);

  for (const { pattern, id, description } of SECURITY_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        safe: false,
        reason: description,
        pattern: id
      };
    }
  }

  return { safe: true };
};
