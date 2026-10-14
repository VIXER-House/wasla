import type { Metadata } from "next";
import Link from "next/link";
import { COSTS, TRIAL_CREDITS } from "@/lib/plans";
import { Note } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "Credits & billing" };

export default function CreditsDocs() {
  return (
    <>
      <h1>Credits & billing</h1>
      <p>Live API calls are paid with <strong>credits</strong> from your balance. Plans add credits every month; top-up packs add credits once and never expire.</p>
      <table>
        <thead><tr><th>Action</th><th>Credits</th></tr></thead>
        <tbody>
          <tr><td>Send a message (<code>POST /messages</code>)</td><td>{COSTS.messageSent}</td></tr>
          <tr><td>Receive a message (webhook)</td><td>0</td></tr>
          <tr><td>AI reply (<code>POST /ai/reply</code>)</td><td>{COSTS.aiPer1kTokens} per started 1,000 tokens</td></tr>
          <tr><td>Account & usage endpoints</td><td>0</td></tr>
          <tr><td>Anything with a test key</td><td>0</td></tr>
        </tbody>
      </table>
      <ul>
        <li>New accounts receive {TRIAL_CREDITS} credits when they confirm their email.</li>
        <li>Each response includes <code>creditsRemaining</code>. When the balance can&apos;t cover a call you get <code>402 insufficient_credits</code>.</li>
        <li>Every movement is listed in <Link href="/dashboard/billing">Dashboard → Credits & billing</Link>.</li>
      </ul>
      <Note>Meta charges its own WhatsApp conversation fees to the WhatsApp Business account you connect. They are separate from credits.</Note>
    </>
  );
}
