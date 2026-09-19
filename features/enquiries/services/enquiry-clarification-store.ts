export interface EnquiryChatMessageAttachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "document";
  previewUrl?: string;
}

export interface EnquiryChatMessage {
  id: string;
  enquiryId: string;
  sender: "provider" | "client" | "system";
  senderName: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  attachments?: EnquiryChatMessageAttachment[];
  proposalRef?: {
    version: string;
    title: string;
    date: string;
  };
}

const DEFAULT_MESSAGES_BY_ENQUIRY: Record<string, EnquiryChatMessage[]> = {
  "prj-9": [
    {
      id: "msg-prj9-1",
      enquiryId: "prj-9",
      sender: "provider",
      senderName: "Kallisto Studio Architects",
      senderRole: "Service Provider",
      content:
        "Please confirm whether the quoted budget includes furniture, lighting, MEP scope and execution timelines.",
      timestamp: "2026-08-05T14:30:00.000Z",
      attachments: [
        {
          id: "att-1",
          name: "Floor Plan.pdf",
          type: "document",
        },
        {
          id: "att-2",
          name: "Client Requirement.docx",
          type: "document",
        },
      ],
    },
  ],
  "prj-14": [
    {
      id: "msg-prj14-1",
      enquiryId: "prj-14",
      sender: "provider",
      senderName: "Kallisto Studio Architects",
      senderRole: "Service Provider",
      content:
        "Please confirm whether the quoted budget includes furniture, lighting, MEP scope and execution timelines.",
      timestamp: "2026-07-16T14:30:00.000Z",
      attachments: [
        {
          id: "att-1",
          name: "Floor Plan.pdf",
          type: "document",
        },
        {
          id: "att-2",
          name: "Client Requirement.docx",
          type: "document",
        },
      ],
    },
  ],
  "prj-8": [
    {
      id: "msg-prj8-1",
      enquiryId: "prj-8",
      sender: "provider",
      senderName: "Kallisto Studio Architects",
      senderRole: "Service Provider",
      content:
        "Please confirm whether the backwater suite proposal requires private boat docking and solar integration.",
      timestamp: "2026-08-01T11:00:00.000Z",
      attachments: [
        {
          id: "att-prj8-1",
          name: "Suite Layout.pdf",
          type: "document",
        },
      ],
    },
  ],
  "prj-11": [
    {
      id: "msg-prj11-1",
      enquiryId: "prj-11",
      sender: "provider",
      senderName: "Kallisto Studio Architects",
      senderRole: "Service Provider",
      content:
        "Could you clarify if the heritage courtyard design includes laterite stone masonry and traditional timber roofing?",
      timestamp: "2026-07-28T11:30:00.000Z",
      attachments: [
        {
          id: "att-prj11-1",
          name: "Courtyard Concept.pdf",
          type: "document",
        },
      ],
    },
  ],
  "prj-12": [
    {
      id: "msg-prj12-1",
      enquiryId: "prj-12",
      sender: "provider",
      senderName: "Kallisto Studio Architects",
      senderRole: "Service Provider",
      content:
        "Please specify if the duplex penthouse fitout requires private plunge pool structural reinforcement.",
      timestamp: "2026-07-25T15:00:00.000Z",
      attachments: [
        {
          id: "att-prj12-1",
          name: "Penthouse Specs.pdf",
          type: "document",
        },
      ],
    },
  ],
  "prj-13": [
    {
      id: "msg-prj13-1",
      enquiryId: "prj-13",
      sender: "provider",
      senderName: "Kallisto Studio Architects",
      senderRole: "Service Provider",
      content:
        "Please clarify the intended spa pavilion seating capacity and site supervision scope in Munnar.",
      timestamp: "2026-07-20T12:00:00.000Z",
    },
  ],
  "prj-20": [
    {
      id: "msg-prj20-1",
      enquiryId: "prj-20",
      sender: "provider",
      senderName: "Kallisto Studio Architects",
      senderRole: "Service Provider",
      content:
        "Current studio team capacity is fully booked for Q3/Q4. Unable to commit to the requested site supervision schedule in Munnar.",
      timestamp: "2026-07-10T12:00:00.000Z",
    },
  ],
  "prj-21": [
    {
      id: "msg-prj21-1",
      enquiryId: "prj-21",
      sender: "provider",
      senderName: "Kallisto Studio Architects",
      senderRole: "Service Provider",
      content:
        "The 14-day response window for this enquiry expired without a provider response.",
      timestamp: "2026-07-01T12:00:00.000Z",
    },
  ],
};

// In-memory store
const messagesStore: Record<string, EnquiryChatMessage[]> = {
  ...DEFAULT_MESSAGES_BY_ENQUIRY,
};

type Listener = (messages: EnquiryChatMessage[]) => void;
const listeners: Map<string, Set<Listener>> = new Map();

function normalizeId(id: string): string {
  return id.replace(/^prj-/, "").toLowerCase();
}

function findKey(enquiryId: string): string {
  const norm = normalizeId(enquiryId);
  const found = Object.keys(messagesStore).find((k) => normalizeId(k) === norm);
  return found || enquiryId;
}

export function getEnquiryMessages(enquiryId: string): EnquiryChatMessage[] {
  const key = findKey(enquiryId);
  if (!messagesStore[key]) {
    // Check session storage if in browser
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(`kallisto_enq_msgs_${key}`);
        if (saved) {
          messagesStore[key] = JSON.parse(saved);
          return messagesStore[key];
        }
      } catch {
        // Ignore session storage errors
      }
    }
    messagesStore[key] = [];
  }
  return [...messagesStore[key]];
}

export function sendEnquiryMessage(
  enquiryId: string,
  message: Omit<EnquiryChatMessage, "id" | "timestamp" | "enquiryId">
): EnquiryChatMessage {
  const key = findKey(enquiryId);
  const current = getEnquiryMessages(key);

  const newMessage: EnquiryChatMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    enquiryId: key,
    timestamp: new Date().toISOString(),
  };

  messagesStore[key] = [...current, newMessage];

  // Sync to session storage
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(
        `kallisto_enq_msgs_${key}`,
        JSON.stringify(messagesStore[key])
      );
    } catch {
      // Ignore
    }
  }

  // Notify listeners
  notifyListeners(key);

  return newMessage;
}

export function subscribeToEnquiryMessages(
  enquiryId: string,
  listener: Listener
): () => void {
  const key = findKey(enquiryId);
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(listener);

  return () => {
    listeners.get(key)?.delete(listener);
  };
}

function notifyListeners(key: string) {
  const norm = normalizeId(key);
  for (const [k, set] of listeners.entries()) {
    if (normalizeId(k) === norm) {
      const msgs = [...(messagesStore[findKey(k)] || [])];
      set.forEach((fn) => fn(msgs));
    }
  }
}
