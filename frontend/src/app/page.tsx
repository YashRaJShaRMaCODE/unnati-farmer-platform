"use client";

import Link from "next/link";
import { ArrowRight, Landmark, ShieldCheck, Sprout, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useLanguage } from "@/providers/language-provider";

export default function HomePage() {
  const { t } = useLanguage();
  const tools = [
    { icon: Sprout, title: t("landing.recordsTitle"), description: t("landing.recordsBody") },
    { icon: ShieldCheck, title: t("landing.trustTitle"), description: t("landing.trustBody") },
    { icon: Landmark, title: t("landing.financeTitle"), description: t("landing.financeBody") },
    { icon: Store, title: t("landing.marketTitle"), description: t("landing.marketBody") },
  ];

  return (
    <div className="landing-page">
      <header className="landing-header" id="top">
        <Link className="landing-brand" href="/" aria-label="UNNATI home">
          <span className="brand-symbol" aria-hidden="true"><Sprout size={19} /></span>
          <span>UNNATI<small>{t("layout.tagline")}</small></span>
        </Link>
        <div className="landing-header-actions">
          <LanguageToggle />
          <Link className="landing-login" href="/login">{t("landing.login")}</Link>
          <Link href="/register"><Button className="landing-signup">{t("landing.register")}</Button></Link>
        </div>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow"><span aria-hidden="true" />{t("landing.eyebrow")}</p>
            <h1 id="landing-title">{t("landing.headline")} <em>{t("landing.headlineAccent")}</em></h1>
            <p className="landing-lede">{t("landing.intro")}</p>
            <div className="landing-actions">
              <Link href="/onboarding"><Button size="lg" className="landing-primary">{t("landing.start")}<ArrowRight size={16} /></Button></Link>
              <Link className="landing-secondary" href="/register">{t("landing.createAccount")}<span aria-hidden="true">↗</span></Link>
            </div>
            <p className="landing-note"><ShieldCheck size={15} aria-hidden="true" />{t("landing.note")}</p>
          </div>

          <div className="field-illustration" role="img" aria-label={t("landing.illustrationAlt")}>
            <div className="field-sun" />
            <div className="field-topline"><span>UNNATI / {t("landing.fieldLabel")}</span><span>01—04</span></div>
            <svg className="field-lines" viewBox="0 0 700 530" fill="none" aria-hidden="true">
              <path className="field-hill hill-back" d="M0 265c96-89 176-111 253-77 63 28 113 20 180-18 92-53 161-47 267 25v335H0V265Z" />
              <path className="field-hill hill-front" d="M0 331c112-50 190-54 270-8 94 54 158 19 235-24 65-37 119-39 195-5v236H0V331Z" />
              <path className="field-row" d="M24 507c124-113 222-142 330-136 119 6 214 58 322 132M93 529c115-103 205-129 303-126 110 3 202 49 292 116M200 530c67-51 128-75 197-77 77-3 153 20 226 69" />
              <path className="field-path" d="M354 530c-18-92 21-143 76-186 40-31 41-69 23-108" />
              <circle className="field-marker" cx="453" cy="236" r="9" />
            </svg>
            <div className="field-legend"><span className="legend-mark" />{t("landing.fieldCaption")}</div>
          </div>
        </section>

        <section className="landing-tools" aria-labelledby="tools-title">
          <div className="tools-heading">
            <div><p className="landing-eyebrow">{t("landing.toolsEyebrow")}</p><h2 id="tools-title">{t("landing.toolsTitle")}</h2></div>
            <p>{t("landing.toolsIntro")}</p>
          </div>
          <div className="tools-list">
            {tools.map(({ icon: Icon, title, description }, index) => (
              <article className="tool-row" key={title}>
                <span className="tool-index">0{index + 1}</span>
                <span className="tool-icon"><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span>
                <div className="tool-copy"><h3>{title}</h3><p>{description}</p></div>
                <span className="tool-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-close">
          <div><p className="landing-eyebrow">{t("landing.closeEyebrow")}</p><h2>{t("landing.closeTitle")}</h2></div>
          <Link href="/onboarding"><Button size="lg" className="landing-primary">{t("landing.start")}<ArrowRight size={16} /></Button></Link>
        </section>
      </main>
      <footer className="landing-footer"><span>UNNATI</span><p>{t("layout.tagline")}</p><a href="#top">{t("landing.backTop")} ↑</a></footer>
    </div>
  );
}
