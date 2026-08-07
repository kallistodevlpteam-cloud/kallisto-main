import React, { useState } from "react";
import { redactSensitiveData } from "../utils/redactSensitiveData";

interface DataInspectorProps {
  pageId: string;
  providerId?: string;
}

export function DataInspector({ pageId, providerId }: DataInspectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  // Mock page raw data containing credentials and private data to test redaction
  const rawPageData = {
    providerId: providerId || "arjun_arch_provider_id",
    pageId,
    dataSource: "firestore",
    schemaVersion: "v1.1",
    fetchTimestamp: new Date().toISOString(),
    cacheState: "miss",
    resources: ["studio_overview_metrics", "active_projects"],
    dbTarget: "studios/arjun_architects",
    unhandledErrors: [],
    // Sensitive items to test redaction
    credentials: {
      firebaseToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      googleApiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q",
      clientEmail: "sarik@kallisto.com",
      phoneNumber: "+1 555-019-2834",
      rawPassword: "supersecretpassword123",
      nestedSecrets: [
        { secretKey: "api_secret_hash_value" }
      ]
    },
    paymentDetails: {
      accountNumber: "1234-5678-9012-3456",
      cvv: "123",
      balance: "$24,500.00"
    },
    unprotectedField: "This is a safe string that should remain unredacted."
  };

  // Redacted data
  const redactedData = redactSensitiveData(rawPageData);

  // Filter properties based on search query
  const getFilteredData = (obj: any, query: string): any => {
    if (!query) return obj;
    const result: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      if (key.toLowerCase().includes(query.toLowerCase())) {
        result[key] = obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        const filteredNested = getFilteredData(obj[key], query);
        if (Object.keys(filteredNested).length > 0) {
          result[key] = filteredNested;
        }
      }
    });
    return result;
  };

  const filteredData = getFilteredData(redactedData, searchTerm);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(redactedData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clip failure
    }
  };

  return (
    <div>
      <div className="inspector-toolbar">
        <input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="inspector-search"
          aria-label="Search JSON fields"
        />
        <button type="button" onClick={handleCopy} className="inspector-copy-btn">
          {copied ? "Copied!" : "Copy JSON"}
        </button>
      </div>

      <div className="json-inspector-box" aria-label="Sanitized page JSON state">
        {JSON.stringify(filteredData, null, 2)}
      </div>
    </div>
  );
}
