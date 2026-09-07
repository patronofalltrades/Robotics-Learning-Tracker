import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserAvatar } from "../components/user-avatar";

describe("UserAvatar", () => {
  it("renders a user photo accessibly when available", () => {
    render(<UserAvatar name="Ada Lovelace" photoURL="https://example.test/ada.jpg" />);
    expect(screen.getByRole("img", { name: "Ada Lovelace avatar" })).toHaveAttribute("src", "https://example.test/ada.jpg");
  });

  it("falls back to initials when the photo is absent or fails", () => {
    const { container, rerender } = render(<UserAvatar name="Ada Lovelace" />);
    expect(container.querySelector("span")).toHaveTextContent("A");
    rerender(<UserAvatar name="Ada Lovelace" photoURL="https://example.test/ada.jpg" />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("span")).toHaveTextContent("A");
  });

  it("can be decorative when the parent control supplies the accessible name", () => {
    const { container } = render(<UserAvatar name="Ada Lovelace" photoURL="https://example.test/ada.jpg" decorative />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(container.querySelector("img")).toHaveAttribute("aria-hidden", "true");
  });
});
