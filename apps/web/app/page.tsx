// apps/web/app/page.tsx
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <h1>Askian Beta – Web App</h1>
      <p>Dev server is running on <code>http://localhost:3000</code>.</p>
    </main>
  );
}