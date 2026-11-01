// Runs once when the Next.js server starts. Logs which project folder
// and port this server is serving, so it is obvious when the browser is
// hitting a different project's dev server. Node-only code lives in
// instrumentation-node.ts so it stays out of the Edge bundle.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
