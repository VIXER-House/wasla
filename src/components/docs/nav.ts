export const DOCS_NAV = [
  {
    title: "Getting started",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/authentication", label: "Authentication" },
      { href: "/docs/whatsapp-setup", label: "Connect WhatsApp" },
    ],
  },
  {
    title: "API reference",
    items: [
      { href: "/docs/api/messages", label: "Send a message" },
      { href: "/docs/api/ai", label: "AI reply" },
      { href: "/docs/api/account", label: "Account & balance" },
      { href: "/docs/api/usage", label: "Usage" },
    ],
  },
  {
    title: "Guides",
    items: [
      { href: "/docs/webhooks", label: "Receive messages (webhooks)" },
      { href: "/docs/credits", label: "Credits & billing" },
      { href: "/docs/errors", label: "Errors" },
      { href: "/docs/node-library", label: "Node.js library" },
    ],
  },
];

export const DOCS_FLAT = DOCS_NAV.flatMap((g) => g.items);
