import React from "react";
import type { BrandTheme } from "../brand/schema";
import type { Scene } from "../scenario/schema";
import { Intro } from "./scenes/Intro";
import { TextReveal } from "./scenes/TextReveal";
import { DashboardShowcase } from "./scenes/DashboardShowcase";
import { FeatureCards } from "./scenes/FeatureCards";
import { Statistic } from "./scenes/Statistic";
import { CallToAction } from "./scenes/CallToAction";
import { Outro } from "./scenes/Outro";
import { PhoneShowcase } from "./scenes/PhoneShowcase";
import { PhoneShowcase3D } from "./scenes/PhoneShowcase3D";
import { IconShowcase3D } from "./scenes/IconShowcase3D";
import { AssetShowcase } from "./scenes/AssetShowcase";
import { BarChart } from "./charts/BarChart";
import { LineChart } from "./charts/LineChart";
import { Comparison } from "./charts/Comparison";
import { LowerThird } from "./overlays/LowerThird";
import { QuoteCard } from "./overlays/QuoteCard";
import { Callout } from "./overlays/Callout";
import { StatOverlay } from "./overlays/StatOverlay";

/** The single place mapping a scenario scene type to its React component. */
export function renderScene(scene: Scene, theme: BrandTheme): React.ReactElement {
  switch (scene.type) {
    case "intro":
      return React.createElement(Intro, { theme, title: scene.title, subtitle: scene.subtitle });
    case "text-reveal":
      return React.createElement(TextReveal, { theme, lines: scene.lines, align: scene.align });
    case "dashboard-showcase":
      return React.createElement(DashboardShowcase, {
        theme,
        variant: scene.variant,
        title: scene.title,
        metrics: scene.metrics,
      });
    case "feature-cards":
      return React.createElement(FeatureCards, { theme, items: scene.items });
    case "statistic":
      return React.createElement(Statistic, { theme, value: scene.value, label: scene.label, trend: scene.trend });
    case "call-to-action":
      return React.createElement(CallToAction, {
        theme,
        title: scene.title,
        subtitle: scene.subtitle,
        buttonLabel: scene.buttonLabel,
      });
    case "outro":
      return React.createElement(Outro, { theme, title: scene.title, logoText: scene.logoText });
    case "phone-showcase":
      return scene.render === "3d"
        ? React.createElement(PhoneShowcase3D, { theme, dashboardVariant: scene.dashboardVariant })
        : React.createElement(PhoneShowcase, { theme, dashboardVariant: scene.dashboardVariant });
    case "icon-showcase":
      return React.createElement(IconShowcase3D, { theme, shape: scene.shape });
    case "asset-showcase":
      return React.createElement(AssetShowcase, {
        theme,
        src: scene.src,
        entityKind: scene.entityKind,
        label: scene.label,
        caption: scene.caption,
      });
    case "bar-chart":
      return React.createElement(BarChart, { theme, title: scene.title, data: scene.data, unit: scene.unit, source: scene.source });
    case "line-chart":
      return React.createElement(LineChart, { theme, title: scene.title, data: scene.data, unit: scene.unit, source: scene.source });
    case "comparison":
      return React.createElement(Comparison, {
        theme,
        title: scene.title,
        before: scene.before,
        after: scene.after,
        unit: scene.unit,
        betterWhen: scene.betterWhen,
        source: scene.source,
      });
    case "lower-third":
      return React.createElement(LowerThird, { theme, title: scene.title, subtitle: scene.subtitle, position: scene.position });
    case "quote-card":
      return React.createElement(QuoteCard, { theme, quote: scene.quote, author: scene.author, position: scene.position });
    case "callout":
      return React.createElement(Callout, { theme, text: scene.text, position: scene.position });
    case "stat-overlay":
      return React.createElement(StatOverlay, { theme, value: scene.value, label: scene.label, position: scene.position });
    default: {
      const exhaustiveCheck: never = scene;
      throw new Error(`Type de scène non géré: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}
