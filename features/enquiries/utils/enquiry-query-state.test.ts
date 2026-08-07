import { describe, it, expect } from "vitest";
import { parseEnquiryQuery, serializeEnquiryQuery } from "./enquiry-query-state";

describe("Enquiry Query Parameter Parsing & Validation", () => {
  it("should parse valid query parameters correctly", () => {
    const params = new URLSearchParams("q=villa&status=active&source=website&type=residential&stage=new&sort=received_asc&page=3");
    const parsed = parseEnquiryQuery(params);

    expect(parsed.q).toBe("villa");
    expect(parsed.status).toBe("active");
    expect(parsed.source).toBe("website");
    expect(parsed.type).toBe("residential");
    expect(parsed.stage).toBe("new");
    expect(parsed.sort).toBe("received_asc");
    expect(parsed.page).toBe(3);
  });

  it("should fall back to defaults when invalid query parameters are supplied", () => {
    const params = new URLSearchParams("status=invalid_status&sort=invalid_sort&page=-5");
    const parsed = parseEnquiryQuery(params);

    expect(parsed.status).toBeNull();
    expect(parsed.sort).toBe("received_desc");
    expect(parsed.page).toBe(1);
  });

  it("should parse non-integer page value to default page 1", () => {
    const params = new URLSearchParams("page=abc");
    const parsed = parseEnquiryQuery(params);
    expect(parsed.page).toBe(1);
  });
});

describe("Enquiry Query Parameter Serialization", () => {
  it("should serialize state to URLSearchParams correctly", () => {
    const serialized = serializeEnquiryQuery({
      q: "office",
      status: "completed",
      page: 2,
    });

    expect(serialized.get("q")).toBe("office");
    expect(serialized.get("status")).toBe("completed");
    expect(serialized.get("page")).toBe("2");
  });

  it("should omit default page 1 or empty values from URL search parameters", () => {
    const serialized = serializeEnquiryQuery({
      q: "",
      status: null,
      page: 1,
    });

    expect(serialized.has("q")).toBe(false);
    expect(serialized.has("status")).toBe(false);
    expect(serialized.has("page")).toBe(false);
  });

  it("should preserve unrelated pre-existing URL search parameters", () => {
    const existing = new URLSearchParams("theme=dark&client_id=123");
    const serialized = serializeEnquiryQuery(
      {
        q: "renovation",
        status: "active",
      },
      existing
    );

    expect(serialized.get("theme")).toBe("dark");
    expect(serialized.get("client_id")).toBe("123");
    expect(serialized.get("q")).toBe("renovation");
    expect(serialized.get("status")).toBe("active");
  });
});
