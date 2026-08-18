import React from "react";
import styles from "./PageHero.module.css";
import { FiCheckCircle } from "react-icons/fi";

/**
 * The card that opens every page.
 *
 * eyebrow      – small pill above the title (e.g. "Checked out")
 * eyebrowTone  – success | warn | neutral | idle
 * highlight    – tail of the title rendered in brand blue (e.g. the student's name)
 * illustration – artwork shown between the title block and the action slot
 * action       – anything rendered on the right of the title row
 * stats        – [{ key, icon, label, value, hint, tone }] rendered as a
 *                divided strip along the bottom of the card
 */
const PageHero = ({
  eyebrow,
  eyebrowTone = "neutral",
  title,
  highlight,
  subtitle,
  illustration,
  action,
  stats = [],
}) => (
  <section className={styles.hero}>
    <div className={styles.top}>
      <div className={styles.text}>
        {eyebrow && (
          <span className={`${styles.eyebrow} ${styles[eyebrowTone]}`}>
            <FiCheckCircle className={styles.eyebrowIcon} />
            {eyebrow}
          </span>
        )}

        <h1 className={styles.title}>
          {title}
          {highlight && (
            <>
              {" "}
              <span className={styles.highlight}>{highlight}</span>
            </>
          )}
        </h1>

        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <span className={styles.rule} />
      </div>

      {illustration && (
        <div className={styles.art} aria-hidden="true">
          {illustration}
        </div>
      )}

      {action && <div className={styles.side}>{action}</div>}
    </div>

    {stats.length > 0 && (
      <div className={styles.stats}>
        {stats.map((s) => (
          <div
            key={s.key || s.label}
            className={`${styles.tile} ${styles[s.tone || "brand"]}`}
          >
            {s.icon && <div className={styles.tileIcon}>{s.icon}</div>}
            <div className={styles.tileBody}>
              <span className={styles.tileLabel}>{s.label}</span>
              <span className={styles.tileValue}>{s.value}</span>
              {s.hint && <span className={styles.tileHint}>{s.hint}</span>}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default PageHero;
