/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import React, { type ImgHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SourceViewer } from "@/components/source-viewer";
import { TranscriptionForm } from "@/components/transcription-form";
import { WalletProvider } from "@/components/wallet-provider";
import { fixtureBounties } from "@/lib/demo/fixtures";

vi.mock("next/image.js", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    const imageProps = { ...props };
    delete imageProps.fill;
    delete imageProps.priority;
    return <img {...imageProps} />;
  },
}));

describe("workbench", () => {
  it("renders image controls for mobile and desktop core flow", async () => {
    render(<SourceViewer src="/fixtures/typed-notice.svg" label="Typed notice" />);
    expect(screen.getByLabelText("Source image workbench")).toBeInTheDocument();
    await userEvent.click(screen.getByTitle("Zoom in"));
    await userEvent.click(screen.getByTitle("Rotate right"));
    expect(screen.getByLabelText("Brightness")).toBeInTheDocument();
  });

  it("autosaves local transcription drafts and shows no-deployment state", async () => {
    render(
      <WalletProvider>
        <TranscriptionForm bounty={fixtureBounties[0]} />
      </WalletProvider>,
    );
    const textarea = screen.getByPlaceholderText("Line-preserving transcription");
    await userEvent.type(textarea, "North gate opens at six bells.");
    expect(localStorage.getItem("glyphwork:1:draft")).toContain("six bells");
    expect(screen.getByText(/Deployment addresses are required/)).toBeInTheDocument();
  });
});
