import type { Patient } from "@/lib/patients/types";

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "pat-001",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "(415) 555-0182",
    dateOfBirth: "1988-04-12",
    status: "active",
    totalOrders: 14,
    lastOrderDate: "2026-03-02",
    address: {
      line1: "742 Valencia St",
      line2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      zip: "94110",
    },
    shippingAddresses: [
      {
        id: "addr-001",
        label: "Home",
        line1: "742 Valencia St",
        line2: "Apt 4B",
        city: "San Francisco",
        state: "CA",
        zip: "94110",
        isDefault: true,
      },
      {
        id: "addr-002",
        label: "Office",
        line1: "1200 Market St",
        city: "San Francisco",
        state: "CA",
        zip: "94102",
        isDefault: false,
      },
    ],
    paymentMethod: { brand: "Visa", last4: "4242", expMonth: 8, expYear: 2028 },
    orders: [
      { id: "ORD-8821", date: "2026-03-02", status: "delivered", total: 249 },
      { id: "ORD-8744", date: "2026-02-14", status: "delivered", total: 185 },
      { id: "ORD-8610", date: "2026-01-28", status: "cancelled", total: 72 },
    ],
    chatMessages: [
      {
        id: "msg-1",
        sender: "patient",
        content: "Can you confirm the cold-chain instructions for my last order?",
        sentAt: "2026-03-03T14:22:00",
      },
      {
        id: "msg-2",
        sender: "provider",
        content: "Yes — keep refrigerated until use. COA is attached to your order receipt.",
        sentAt: "2026-03-03T15:01:00",
      },
    ],
    notes: [
      {
        id: "note-1",
        content: "Prefers email updates over SMS for refill reminders.",
        createdAt: "2026-02-20T10:00:00",
        author: "Dr. Rivera",
      },
      {
        id: "note-2",
        content: "Completed initial intake. No contraindications noted.",
        createdAt: "2025-11-05T09:30:00",
        author: "Dr. Rivera",
      },
    ],
    requests: [
      {
        id: "req-1",
        productName: "Semaglutide Pharmacy Grade",
        description: "Cold-chain GLP-1 with verified lot release documentation.",
        category: "GLP-1",
        dateRequested: "2026-03-04",
        doctorName: "Dr. Rivera",
        price: 210,
        requestReason:
          "Patient completed 12-week protocol and requested continuation with pharmacy-grade lot.",
        status: "pending_review",
      },
    ],
  },
  {
    id: "pat-002",
    name: "Marcus Webb",
    email: "marcus.webb@email.com",
    phone: "(628) 555-0199",
    dateOfBirth: "1975-09-30",
    status: "active",
    totalOrders: 6,
    lastOrderDate: "2026-02-18",
    address: {
      line1: "901 Howard St",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
    },
    shippingAddresses: [
      {
        id: "addr-003",
        label: "Home",
        line1: "901 Howard St",
        city: "San Francisco",
        state: "CA",
        zip: "94103",
        isDefault: true,
      },
    ],
    paymentMethod: { brand: "Mastercard", last4: "8210", expMonth: 3, expYear: 2027 },
    orders: [
      { id: "ORD-8702", date: "2026-02-18", status: "shipped", total: 149 },
      { id: "ORD-8520", date: "2026-01-05", status: "delivered", total: 89 },
    ],
    chatMessages: [
      {
        id: "msg-3",
        sender: "provider",
        content: "Your refill is approved — order ORD-8702 is on the way.",
        sentAt: "2026-02-18T11:15:00",
      },
    ],
    notes: [],
    requests: [],
  },
  {
    id: "pat-003",
    name: "Elena Vasquez",
    email: "elena.v@email.com",
    phone: "(510) 555-0144",
    dateOfBirth: "1992-01-08",
    status: "inactive",
    totalOrders: 2,
    lastOrderDate: "2025-10-12",
    address: {
      line1: "2200 Broadway",
      line2: "Unit 12",
      city: "Oakland",
      state: "CA",
      zip: "94612",
    },
    shippingAddresses: [
      {
        id: "addr-004",
        label: "Home",
        line1: "2200 Broadway",
        line2: "Unit 12",
        city: "Oakland",
        state: "CA",
        zip: "94612",
        isDefault: true,
      },
    ],
    paymentMethod: { brand: "Amex", last4: "1005", expMonth: 11, expYear: 2026 },
    orders: [
      { id: "ORD-8011", date: "2025-10-12", status: "delivered", total: 72 },
      { id: "ORD-7888", date: "2025-08-22", status: "delivered", total: 72 },
    ],
    chatMessages: [],
    notes: [
      {
        id: "note-3",
        content: "Account paused — patient requested hold until Q2.",
        createdAt: "2025-11-01T16:00:00",
        author: "Staff",
      },
    ],
    requests: [
      {
        id: "req-2",
        productName: "BPC-157 Research Peptide",
        description: "Laboratory-grade BPC-157 for verified research protocols.",
        category: "Peptides",
        dateRequested: "2025-09-15",
        doctorName: "Dr. Kim",
        price: 89,
        requestReason: "Requested for post-surgical recovery support per prior consult.",
        status: "approved",
      },
    ],
  },
];

export function getPatientById(id: string): Patient | undefined {
  return MOCK_PATIENTS.find((patient) => patient.id === id);
}
