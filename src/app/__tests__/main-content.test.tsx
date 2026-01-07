import { render, screen, fireEvent } from "@testing-library/react";
import { MainContent } from "../main-content";
import { describe, it, expect, vi } from "vitest";

// Mock the child components
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div>Chat Interface</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div>File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div>Code Editor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div>Preview Frame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div>Header Actions</div>,
}));

describe("MainContent - Toggle Buttons", () => {
  it("should toggle between preview and code views when clicking the tabs", () => {
    render(<MainContent user={null} project={undefined} />);

    // Initially should show preview
    expect(screen.getByText("Preview Frame")).toBeInTheDocument();
    expect(screen.queryByText("Code Editor")).not.toBeInTheDocument();

    // Click on Code tab
    const codeTab = screen.getByRole("tab", { name: /code/i });
    fireEvent.click(codeTab);

    // Should now show code editor
    expect(screen.queryByText("Preview Frame")).not.toBeInTheDocument();
    expect(screen.getByText("Code Editor")).toBeInTheDocument();

    // Click back on Preview tab
    const previewTab = screen.getByRole("tab", { name: /preview/i });
    fireEvent.click(previewTab);

    // Should show preview again
    expect(screen.getByText("Preview Frame")).toBeInTheDocument();
    expect(screen.queryByText("Code Editor")).not.toBeInTheDocument();
  });

  it("should have correct active state on tabs", () => {
    render(<MainContent user={null} project={undefined} />);

    const previewTab = screen.getByRole("tab", { name: /preview/i });
    const codeTab = screen.getByRole("tab", { name: /code/i });

    // Initially preview tab should be active
    expect(previewTab).toHaveAttribute("data-state", "active");
    expect(codeTab).toHaveAttribute("data-state", "inactive");

    // Click on Code tab
    fireEvent.click(codeTab);

    // Code tab should now be active
    expect(previewTab).toHaveAttribute("data-state", "inactive");
    expect(codeTab).toHaveAttribute("data-state", "active");

    // Click back on Preview tab
    fireEvent.click(previewTab);

    // Preview tab should be active again
    expect(previewTab).toHaveAttribute("data-state", "active");
    expect(codeTab).toHaveAttribute("data-state", "inactive");
  });
});
