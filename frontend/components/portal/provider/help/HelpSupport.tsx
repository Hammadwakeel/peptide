"use client";

import { useMemo, useState } from "react";
import { FrontierBookOpenIcon } from "@/components/icons/frontier";
import { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import { ProviderPageToolbar } from "@/components/portal/provider/shared/ProviderPageToolbar";
import { fuseSearch } from "@/lib/search/fuse";
import { HELP_ARTICLE_SEARCH_KEYS } from "@/lib/search/keys";
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

  const filteredArticles = useMemo(
    () => fuseSearch(ARTICLES, query, HELP_ARTICLE_SEARCH_KEYS),
    [query],
  );

  function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Ticket submitted. A confirmation email has been sent.");
    setTicketSubject("");
    setTicketDescription("");
    setTicketPriority("normal");
  }

  return (
    <div className="space-y-5">
      <ProviderPageToolbar title="Help / Support" />

      <ProviderPageSection
        icon={FrontierBookOpenIcon}
        title="Knowledge base"
        subtitle={`${filteredArticles.length} article${filteredArticles.length === 1 ? "" : "s"}`}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className={`${authInputClassName} mb-4`}
          data-tour="doctor-help-search"
        />
        <ul className="space-y-2">
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
      </ProviderPageSection>

      <ProviderPageSection icon={frontierBrandIcons.forward} title="Submit a ticket">
        <form onSubmit={handleTicketSubmit} className="space-y-4" data-tour="doctor-help-ticket-form">
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
            className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white hover:bg-pacific-teal"
          >
            Submit ticket
          </button>
        </form>
      </ProviderPageSection>

      <ProviderPageSection icon={frontierBrandIcons.headset} title="Contact us">
        <ul className="space-y-3 text-sm text-deep-teal/70">
          <li>
            <span className="font-light text-deep-teal">Email:</span>{" "}
            <a href="mailto:support@frontierbiomed.com" className="text-pacific-teal hover:underline">
              support@frontierbiomed.com
            </a>
          </li>
          <li>
            <span className="font-light text-deep-teal">Phone:</span>{" "}
            <a href="tel:+18005551234" className="text-pacific-teal hover:underline">
              (800) 555-1234
            </a>
          </li>
          <li>
            <span className="font-light text-deep-teal">Live chat:</span>{" "}
            <button
              type="button"
              onClick={() => toast.info("Live chat scaffold — connect Intercom or Zendesk here.")}
              className="text-pacific-teal hover:underline"
            >
              Start live chat
            </button>
          </li>
        </ul>
      </ProviderPageSection>
    </div>
  );
}
