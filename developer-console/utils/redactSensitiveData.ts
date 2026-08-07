const EXACT_SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "cookie",
  "cvv",
  "ssn",
  "authorization",
  "key",
  "private_key",
  "apikey",
  "access_token",
  "client_secret",
  "session",
  "credential",
  "credentials",
]);

const SENSITIVE_KEY_REGEX = /^(?:.*_)?(?:password|token|secret|cookie|cvv|ssn|key|auth|api_?key)(?:_.*)?$/i;

// Safe list of keys that must NOT be redacted even if they match patterns
const SAFE_ALLOWLIST = new Set([
  "pageid",
  "pagename",
  "status",
  "owner",
  "timestamp",
  "details",
  "reasons",
  "itemid",
  "category",
  "title",
  "description",
  "isrequired",
  "isautomated",
  "weight",
  "blockinglevel",
  "checkedat",
  "checkedby",
  "notes",
  "evidence",
  "buildid",
  "manifestversion",
  "actionid",
  "actionname",
  "uicomponent",
  "eventhandler",
  "servicemethod",
  "apiendpoint",
  "databasetarget",
  "requiredpermission",
  "role",
  "requiredroles",
  "routepattern",
  "diagnostics",
  "requiredtests",
  "severity",
  "createddate",
  "resolveddate",
  "resolutionnotes",
]);

// Value pattern matching
const JWT_PATTERN = /^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
const GOOGLE_API_KEY_PATTERN = /^AIzaSy[A-Za-z0-9_-]{33}$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s-()]{7,20}$/;

export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "[MASKED EMAIL]";
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0] || ""}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "[MASKED PHONE]";
  return `+${phone.startsWith("+") ? phone.slice(1, 3) : ""}***${digits.slice(-4)}`;
}

export function redactSensitiveData(data: any, depth = 0, visited = new WeakSet()): any {
  const MAX_DEPTH = 10;
  if (depth > MAX_DEPTH) {
    return "[MAX_DEPTH_REACHED]";
  }

  if (data === null || data === undefined) {
    return data;
  }

  // Primitive values
  if (typeof data !== "object") {
    if (typeof data === "string") {
      // Check for authorization header
      const lowerStr = data.toLowerCase();
      if (lowerStr.startsWith("bearer ") || lowerStr.startsWith("basic ")) {
        return "[REDACTED AUTH HEADER]";
      }

      // Check values
      if (JWT_PATTERN.test(data)) return "[REDACTED JWT]";
      if (GOOGLE_API_KEY_PATTERN.test(data)) return "[REDACTED API KEY]";
      if (EMAIL_PATTERN.test(data)) return maskEmail(data);
      if (PHONE_PATTERN.test(data) && data.replace(/[^0-9]/g, "").length >= 10) return maskPhone(data);

      // Check for URL containing query parameters
      if (data.includes("?") && (data.startsWith("http://") || data.startsWith("https://") || data.startsWith("/"))) {
        try {
          const parts = data.split("?");
          const urlBase = parts[0];
          const queryParams = new URLSearchParams(parts[1]);
          let changed = false;
          queryParams.forEach((value, name) => {
            const normName = name.toLowerCase().trim();
            if (EXACT_SENSITIVE_KEYS.has(normName) || SENSITIVE_KEY_REGEX.test(normName)) {
              queryParams.set(name, "[REDACTED]");
              changed = true;
            }
          });
          if (changed) {
            return `${urlBase}?${queryParams.toString()}`;
          }
        } catch {
          // Fallback if URL parsing fails
        }
      }

      // Check for serialized JSON strings
      if ((data.startsWith("{") && data.endsWith("}")) || (data.startsWith("[") && data.endsWith("]"))) {
        try {
          const parsed = JSON.parse(data);
          const redacted = redactSensitiveData(parsed, depth + 1, visited);
          return JSON.stringify(redacted);
        } catch {
          // not JSON
        }
      }
    }
    return data;
  }

  // Circular reference check
  if (visited.has(data)) {
    return "[CIRCULAR_REFERENCE]";
  }

  visited.add(data);

  // Arrays
  if (Array.isArray(data)) {
    const redactedArray = data.map((item) => redactSensitiveData(item, depth + 1, visited));
    visited.delete(data);
    return redactedArray;
  }

  // Error handling
  if (data instanceof Error) {
    const redactedError = {
      name: data.name,
      message: redactSensitiveData(data.message, depth + 1, visited),
      stack: data.stack ? "[REDACTED STACK]" : undefined,
    };
    visited.delete(data);
    return redactedError;
  }

  // Objects
  const redactedObj: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const normalizedKey = key.toLowerCase().trim();

    if (SAFE_ALLOWLIST.has(normalizedKey)) {
      redactedObj[key] = redactSensitiveData(data[key], depth + 1, visited);
      continue;
    }

    if (EXACT_SENSITIVE_KEYS.has(normalizedKey) || SENSITIVE_KEY_REGEX.test(normalizedKey)) {
      redactedObj[key] = "[REDACTED]";
      continue;
    }

    redactedObj[key] = redactSensitiveData(data[key], depth + 1, visited);
  }

  visited.delete(data);
  return redactedObj;
}

export function redactPayload(data: any): any {
  try {
    const serialized = JSON.stringify(data);
    const MAX_SIZE = 1024 * 1024; // 1MB limit
    if (serialized.length > MAX_SIZE) {
      return "[PAYLOAD_TOO_LARGE]";
    }
  } catch (err) {
    return "[UNSERIALIZABLE_PAYLOAD]";
  }
  return redactSensitiveData(data);
}
