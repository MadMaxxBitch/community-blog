import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("Neighbourhood Notes", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("filters stories by a search term", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("textbox", { name: "Search stories" }), "noodle");
    expect(screen.getAllByRole("heading", { name: /sunday bowl/i })).toHaveLength(2);
    expect(screen.queryByRole("heading", { name: /cliff walks/i })).not.toBeInTheDocument();
  });

  it("publishes a local story and shows its detail view", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /write a story/i }));
    await user.type(screen.getByLabelText("Story title"), "The bench behind the station");
    await user.type(screen.getByLabelText("Short introduction"), "A quiet place for people watching.");
    await user.type(screen.getByLabelText("Your story"), "I found it last week.\n\nNow I walk there often.");
    await user.click(screen.getByRole("button", { name: /publish story/i }));
    expect(screen.getByRole("heading", { name: "The bench behind the station" })).toBeInTheDocument();
    expect(screen.getByText(/written by/i)).toHaveTextContent("You");
  });

  it("reloads published local stories from browser storage", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole("button", { name: /write a story/i }));
    await user.type(screen.getByLabelText("Story title"), "The corner bakery bench");
    await user.type(screen.getByLabelText("Short introduction"), "Still warm after the morning rush.");
    await user.type(screen.getByLabelText("Your story"), "It catches the first sun.\n\nNow it is part of my route.");
    await user.click(screen.getByRole("button", { name: /publish story/i }));
    unmount();

    render(<App />);

    expect(screen.getByRole("button", { name: "The corner bakery bench" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("neighbourhood-notes-posts"))[0]).toMatchObject({
      title: "The corner bakery bench",
      author: "You",
    });
  });

  it("validates and persists a new comment on a story", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "The cliff walks that make a city feel larger" }));
    await user.click(screen.getByRole("button", { name: /post comment/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/add your name/i);
    await user.type(screen.getByLabelText("Your name"), "Rory");
    await user.type(screen.getByLabelText("Add to the conversation"), "I am taking this route tomorrow morning.");
    await user.click(screen.getByRole("button", { name: /post comment/i }));
    expect(screen.getByText("I am taking this route tomorrow morning.")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("neighbourhood-notes-comments"))["cliff-walks"][0]).toMatchObject({ name: "Rory" });
  });
});
