import { Loader2, FileText, FileEdit, FilePlus, Trash2, FolderOpen } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  state: string;
  args?: {
    command?: string;
    path?: string;
    new_path?: string;
  };
}

function getToolMessage(toolName: string, args?: ToolInvocationBadgeProps["args"]): string {
  if (!args) return toolName;

  const fileName = args.path?.split("/").pop() || args.path;

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating ${fileName}`;
      case "str_replace":
        return `Editing ${fileName}`;
      case "insert":
        return `Editing ${fileName}`;
      case "view":
        return `Viewing ${fileName}`;
      default:
        return `Editing ${fileName}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete":
        return `Deleting ${fileName}`;
      case "rename":
        const newFileName = args.new_path?.split("/").pop() || args.new_path;
        return `Renaming ${fileName}${newFileName ? ` to ${newFileName}` : ""}`;
      default:
        return `Managing ${fileName}`;
    }
  }

  return toolName;
}

function getToolIcon(toolName: string, args?: ToolInvocationBadgeProps["args"]) {
  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":
        return FilePlus;
      case "view":
        return FolderOpen;
      case "str_replace":
      case "insert":
        return FileEdit;
      default:
        return FileText;
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "delete":
        return Trash2;
      case "rename":
        return FileEdit;
      default:
        return FileText;
    }
  }

  return FileText;
}

export function ToolInvocationBadge({ toolName, state, args }: ToolInvocationBadgeProps) {
  const message = getToolMessage(toolName, args);
  const Icon = getToolIcon(toolName, args);
  const isComplete = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
          <Icon className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 flex-shrink-0" />
          <Icon className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
