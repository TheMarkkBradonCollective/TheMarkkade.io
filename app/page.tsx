import Link from "next/link";
import "@/styles/landing.css";

export default function HomePage() {
  return (
    <div className="landing">
      <div className="atmosphere" aria-hidden="true" />
      <header className="site-header">
        <Link className="brand" href="/">
          Markkade
        </Link>
      </header>

      <main className="hero">
        <p className="brand-mark">Markkade</p>
        <h1>Play the currency universe.</h1>
        <p className="lede">
          Casino-style slots, arcade heat, and one wallet that follows you across every game.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/games/markkdbills">
            Play Markk&apos;d Bills
          </Link>
          <Link className="btn btn-ghost" href="/founder">
            Founder Live Ops
          </Link>
        </div>
      </main>

      <section className="launch-strip" aria-label="Launch game">
        <div className="launch-copy">
          <p className="eyebrow">Launch Game</p>
          <h2>Markk&apos;d Bills</h2>
          <p>5-reel currency slots. Match symbols, trade the global exchange, cash out to Markkade.</p>
        </div>
        <Link className="btn btn-primary" href="/games/markkdbills">
          Spin Now
        </Link>
      </section>

      <section className="launch-strip founder-strip" aria-label="Founder ops">
        <div className="launch-copy">
          <p className="eyebrow">Founder</p>
          <h2>Live Ops Dashboard</h2>
          <p>
            House bank starts at $100,000,000,000. Approve players to grant $10,000 each. Wins pay from
            the bank; losses add to it. Founder can watch — not play.
          </p>
        </div>
        <Link className="btn btn-ghost" href="/founder">
          Founder Login
        </Link>
      </section>

      <footer className="site-footer">
        <span>Approved players get $10,000 USD</span>
        <span>© 2026 Markkade</span>
      </footer>
    </div>
  );
}
