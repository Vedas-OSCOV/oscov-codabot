import Navbar from "@/components/Navbar";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />

      <section className={styles.hero}>
        <h1 className={styles.title}>
          Code. Solve. <span className={styles.accent}>Ascend.</span>
        </h1>
        <p className={styles.subtitle}>
          The Vedas-OSCOV Coding Marathon. Join the elite, solve real open-source issues, and prove your mastery.
        </p>
        <div className={styles.ctas}>
          <Link href="/issues" className="button-primary">
            Start Coding
          </Link>
          <Link href="/leaderboard" className={styles.secondaryLink}>
            View Leaderboard &gt;
          </Link>
        </div>
      </section>

      <section className={styles.stats}>
        <div className="glass-panel" style={{ padding: '40px', width: '1000px', display: 'flex', justifyContent: 'space-around' }}>
          <div className={styles.statItem}>
            <h3>$10k+</h3>
            <p>Prizes Pool</p>
          </div>
          <div className={styles.statItem}>
            <h3>50+</h3>
            <p>Open Issues</p>
          </div>
          <div className={styles.statItem}>
            <h3>24h</h3>
            <p>Verification Time</p>
          </div>
        </div>
      </section>
    </main>
  );
}
