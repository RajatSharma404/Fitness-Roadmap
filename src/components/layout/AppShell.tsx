import { ReactNode } from "react";
import { ShellChrome } from "./ShellChrome";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: Readonly<AppShellProps>) {
  return <ShellChrome>{children}</ShellChrome>;
}
