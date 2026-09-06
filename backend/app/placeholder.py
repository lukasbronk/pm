def render_placeholder_html() -> str:
    return """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Project Management MVP</title>
    <style>
      :root {
        --accent-yellow: #ecad0a;
        --primary-blue: #209dd7;
        --secondary-purple: #753991;
        --navy-dark: #032147;
        --gray-text: #888888;
        --surface: #f7f8fb;
        --stroke: rgba(3, 33, 71, 0.08);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", sans-serif;
        background: linear-gradient(180deg, #ffffff 0%, var(--surface) 100%);
        color: var(--navy-dark);
      }
      main {
        max-width: 880px;
        margin: 0 auto;
        min-height: 100vh;
        padding: 64px 24px;
        display: flex;
        align-items: center;
      }
      .panel {
        width: 100%;
        background: rgba(255, 255, 255, 0.88);
        border: 1px solid var(--stroke);
        border-radius: 28px;
        padding: 32px;
        box-shadow: 0 18px 40px rgba(3, 33, 71, 0.12);
      }
      .eyebrow {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: var(--gray-text);
      }
      h1 {
        margin: 16px 0 0;
        font-size: 42px;
        line-height: 1.1;
      }
      p {
        max-width: 640px;
        line-height: 1.6;
        color: var(--gray-text);
      }
      .status {
        margin-top: 24px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 999px;
        background: var(--surface);
        border: 1px solid var(--stroke);
        font-weight: 600;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: var(--accent-yellow);
      }
      code {
        color: var(--secondary-purple);
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <div class="eyebrow">Local Scaffold</div>
        <h1>Project Management MVP backend is running.</h1>
        <p>
          This placeholder page confirms FastAPI is serving the local app at
          <code>/</code>. The frontend build will replace this page in Part 3.
        </p>
        <div class="status">
          <span class="dot"></span>
          Health endpoint available at <code>/api/health</code>
        </div>
      </section>
    </main>
  </body>
</html>"""
