import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

describe("ToolInvocationBadge", () => {
  describe("str_replace_editor tool", () => {
    test("displays 'Creating filename' for create command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="call"
          args={{ command: "create", path: "/components/Button.tsx" }}
        />
      );

      expect(screen.getByText("Creating Button.tsx")).toBeDefined();
    });

    test("displays 'Editing filename' for str_replace command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="call"
          args={{ command: "str_replace", path: "/App.jsx" }}
        />
      );

      expect(screen.getByText("Editing App.jsx")).toBeDefined();
    });

    test("displays 'Editing filename' for insert command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="call"
          args={{ command: "insert", path: "/utils/helper.ts" }}
        />
      );

      expect(screen.getByText("Editing helper.ts")).toBeDefined();
    });

    test("displays 'Viewing filename' for view command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="call"
          args={{ command: "view", path: "/styles/main.css" }}
        />
      );

      expect(screen.getByText("Viewing main.css")).toBeDefined();
    });

    test("handles path without leading slash", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="call"
          args={{ command: "create", path: "Button.tsx" }}
        />
      );

      expect(screen.getByText("Creating Button.tsx")).toBeDefined();
    });

    test("handles nested file paths", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="call"
          args={{ command: "create", path: "/components/ui/card/Card.tsx" }}
        />
      );

      expect(screen.getByText("Creating Card.tsx")).toBeDefined();
    });
  });

  describe("file_manager tool", () => {
    test("displays 'Deleting filename' for delete command", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          state="call"
          args={{ command: "delete", path: "/OldComponent.tsx" }}
        />
      );

      expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
    });

    test("displays 'Renaming filename to new filename' for rename command", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          state="call"
          args={{
            command: "rename",
            path: "/Button.tsx",
            new_path: "/components/Button.tsx",
          }}
        />
      );

      expect(screen.getByText("Renaming Button.tsx to Button.tsx")).toBeDefined();
    });

    test("displays 'Renaming filename' when new_path is not provided", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          state="call"
          args={{
            command: "rename",
            path: "/OldFile.tsx",
          }}
        />
      );

      expect(screen.getByText("Renaming OldFile.tsx")).toBeDefined();
    });
  });

  describe("visual states", () => {
    test("shows loading spinner when state is not 'result'", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="call"
          args={{ command: "create", path: "/App.jsx" }}
        />
      );

      // Check for loading spinner class
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeDefined();
    });

    test("shows success indicator when state is 'result'", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="result"
          args={{ command: "create", path: "/App.jsx" }}
        />
      );

      // Check for success dot
      const successDot = container.querySelector(".bg-emerald-500");
      expect(successDot).toBeDefined();

      // Should not have loading spinner
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeNull();
    });
  });

  describe("edge cases", () => {
    test("handles missing args gracefully", () => {
      render(<ToolInvocationBadge toolName="str_replace_editor" state="call" />);

      expect(screen.getByText("str_replace_editor")).toBeDefined();
    });

    test("handles unknown tool name", () => {
      render(
        <ToolInvocationBadge
          toolName="unknown_tool"
          state="call"
          args={{ command: "create", path: "/test.txt" }}
        />
      );

      expect(screen.getByText("unknown_tool")).toBeDefined();
    });

    test("handles empty path", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="call"
          args={{ command: "create", path: "" }}
        />
      );

      expect(screen.getByText("Creating ")).toBeDefined();
    });

    test("handles path with only slashes", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="call"
          args={{ command: "create", path: "/" }}
        />
      );

      // Should show empty string after "Creating "
      expect(screen.getByText("Creating ")).toBeDefined();
    });
  });
});
