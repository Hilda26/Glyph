import type { BountySummary, SubmissionReceipt } from "@/lib/contract/types";

export type Fixture = {
  id: string;
  title: string;
  label: string;
  image: string;
  mode: "PLAIN_TEXT" | "KEY_VALUE";
  hash: string;
  fields: string[];
  difficulty: "clean" | "handwritten" | "ambiguous";
};

export const fixtures: Fixture[] = [
  {
    id: "folio-typed-001",
    title: "Harbor notice, typed circular",
    label: "Port record circular, 1908",
    image: "/fixtures/typed-notice.svg",
    mode: "PLAIN_TEXT",
    hash: "8a1453fee17b7782bd20765518ead9f1c3fe3b6b2fbefb1ee02a369f63e77fd0",
    fields: [],
    difficulty: "clean",
  },
  {
    id: "folio-ledger-014",
    title: "Ledger page with shipment entries",
    label: "Municipal supply ledger, 1893",
    image: "/fixtures/handwritten-ledger.svg",
    mode: "KEY_VALUE",
    hash: "f0b04554c3a29a57ccc27569b55018d93339b9bd6ade97a19c8deb74eec56f65",
    fields: ["date", "location", "item", "quantity", "note"],
    difficulty: "handwritten",
  },
  {
    id: "folio-smudged-022",
    title: "Smudged accession card",
    label: "Museum accession note, c. 1912",
    image: "/fixtures/ambiguous-card.svg",
    mode: "KEY_VALUE",
    hash: "0c292719314084545be0c95d6219aba1227fa1ec7449d9a986b850ed00a5b87d",
    fields: ["date", "catalog", "object", "condition"],
    difficulty: "ambiguous",
  },
];

export const fixtureBounties: BountySummary[] = fixtures.map((fixture, index) => ({
  id: String(index + 1),
  sponsor: "0x0000000000000000000000000000000000000000",
  title: fixture.title,
  sourceLabel: fixture.label,
  sourceUrl: fixture.image,
  expectedHash: fixture.hash,
  schemaMode: fixture.mode,
  fieldLabels: fixture.fields,
  rewardWei: BigInt(index + 1) * 2_500_000_000_000_000_000n,
  deadline: 1_820_000_000 + index * 86_400,
  attempts: index,
  maxAttempts: 3,
  status: index === 2 ? "SUBMITTED" : "OPEN",
  definitionHash: `fixture-${fixture.id}`,
}));

export const fixtureReceipts: SubmissionReceipt[] = [
  {
    id: "1",
    bountyId: "2",
    worker: "0x0000000000000000000000000000000000000001",
    result: "ACCEPT",
    reason: "All required ledger fields are present with minor spelling variance only.",
    paid: true,
    sourceMatch: "MATCH",
    completeness: "COMPLETE",
    accuracy: "MINOR_ERRORS",
    transcript: '{"date":"June 5 1893","location":"North Wharf","item":"lamp oil","quantity":"12 tins","note":"delivered"}',
  },
  {
    id: "2",
    bountyId: "3",
    worker: "0x0000000000000000000000000000000000000002",
    result: "INCONCLUSIVE",
    reason: "The catalog mark is materially smudged and cannot be verified independently.",
    paid: false,
    sourceMatch: "MATCH",
    completeness: "MINOR_OMISSIONS",
    accuracy: "UNCLEAR",
    transcript: '{"date":"1912","catalog":"uncertain","object":"brass key","condition":"oxidized"}',
  },
];
