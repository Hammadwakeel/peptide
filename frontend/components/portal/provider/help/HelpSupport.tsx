"use client";

import { useMemo, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { toast } from "@/lib/toast";

const ARTICLES = [
  { id: "1", title: "How to verify a peptide lot", category: "Compliance" },
  { id: "2", title: "Setting up your provider storefront", category: "Onboarding" },
  { id: "3", title: "Managing organization users", category: "Team" },
  { id: "4", title: "Cold chain shipping requirements", category: "Operations" },
];

export function HelpSupport() {
  const [query, setQuery] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState("normal");

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ARTICLES;
    return ARTICLES.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q),
    );
  }, [query]);

  function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Ticket submitted. A confirmation email has been sent.");
    setTicketSubject("");
    setTicketDescription("");
    setTicketPriority("normal");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-light text-deep-teal">Knowledge Base</h2>
        <p className="mt-1 text-sm text-deep-teal/60">Search help articles and onboarding guides.</p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className={`${authInputClassName} mt-4`}
        />
        <ul className="mt-4 space-y-2">
          {filteredArticles.map((article) => (
            <li
              key={article.id}
              className="flex items-center justify-between rounded-xl border border-deep-teal/10 px-4 py-3"
            >
              <span className="text-sm text-deep-teal">{article.title}</span>
              <span className="text-xs text-deep-teal/45">{article.category}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-light text-deep-teal">Submit a Ticket</h2>
        <form onSubmit={handleTicketSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="ticket-subject" className={authLabelClassName}>Subject</label>
            <input
              id="ticket-subject"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className={authInputClassName}
            />
          </div>
          <div>
            <label htmlFor="ticket-description" className={authLabelClassName}>Description</label>
            <textarea
              id="ticket-description"
              required
              rows={4}
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              className={`${authInputClassName} resize-none`}
            />
          </div>
          <div>
            <label htmlFor="ticket-priority" className={authLabelClassName}>Priority</label>
            <select
              id="ticket-priority"
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value)}
              className={authInputClassName}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal"
          >
            Submit ticket
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-light text-deep-teal">Contact Us</h2>
        <ul className="mt-4 space-y-3 text-sm text-deep-teal/70">
          <li>
            <span className="font-medium text-deep-teal">Email:</span>{" "}
            <a href="mailto:support@frontierbiomed.com" className="text-pacific-teal hover:underline">
              support@frontierbiomed.com
            </a>
          </li>
          <li>
            <span className="font-medium text-deep-teal">Phone:</span>{" "}
            <a href="tel:+18005551234" className="text-pacific-teal hover:underline">
              (800) 555-1234
            </a>
          </li>
          <li>
            <span className="font-medium text-deep-teal">Live chat:</span>{" "}
            <button
              type="button"
              onClick={() => toast.info("Live chat scaffold — connect Intercom or Zendesk here.")}
              className="text-pacific-teal hover:underline"
            >
              Start live chat
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
}
