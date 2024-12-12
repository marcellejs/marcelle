<script setup lang="ts">
import { computed } from "vue";
import { withBase, useData as useData$ } from "vitepress";
import type { DefaultTheme } from "vitepress/theme";

interface Props {
  tag?: string;
  size?: "medium" | "big";
  theme?: "brand" | "alt" | "sponsor";
  text: string;
  href?: string;
  target?: string;
  rel?: string;
}

const KNOWN_EXTENSIONS = new Set();
function treatAsHtml(filename: string): boolean {
  if (KNOWN_EXTENSIONS.size === 0) {
    const extraExts =
      (typeof process === "object" && process.env?.VITE_EXTRA_EXTENSIONS) ||
      (import.meta as any).env?.VITE_EXTRA_EXTENSIONS ||
      "";

    // md, html? are intentionally omitted
    (
      "3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll," +
      "doc,eps,epub,exe,gif,gz,ics,ief,jar,jpe,jpeg,jpg,js,json,jsonld,m4a," +
      "man,mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx," +
      "opus,otf,p10,p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif," +
      "tiff,tr,ts,tsv,ttf,txt,vtt,wav,weba,webm,webp,woff,woff2,xhtml,xml," +
      "yaml,yml,zip" +
      (extraExts && typeof extraExts === "string" ? "," + extraExts : "")
    )
      .split(",")
      .forEach((ext) => KNOWN_EXTENSIONS.add(ext));
  }

  const ext = filename.split(".").pop();

  return ext == null || !KNOWN_EXTENSIONS.has(ext.toLowerCase());
}

const useData: typeof useData$<DefaultTheme.Config> = useData$;

function normalizeLink(url: string): string {
  const { pathname, search, hash, protocol } = new URL(url, "http://a.com");

  if (
    EXTERNAL_URL_RE.test(url) ||
    url.startsWith("#") ||
    !protocol.startsWith("http") ||
    !treatAsHtml(pathname)
  )
    return url;

  const { site } = useData();

  const normalizedPath =
    pathname.endsWith("/") || pathname.endsWith(".html")
      ? url
      : url.replace(
          /(?:(^\.+)\/)?.*$/,
          `$1${pathname.replace(
            /(\.md)?$/,
            site.value.cleanUrls ? "" : ".html"
          )}${search}${hash}`
        );

  return withBase(normalizedPath);
}

const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;

const props = withDefaults(defineProps<Props>(), {
  size: "medium",
  theme: "brand",
});

const isExternal = computed(
  () => props.href && EXTERNAL_URL_RE.test(props.href)
);

const component = computed(() => {
  return props.tag || (props.href ? "a" : "button");
});
</script>

<template>
  <component
    :is="component"
    class="VPButton"
    :class="[size, theme]"
    :href="href ? normalizeLink(href) : undefined"
    :target="props.target ?? (isExternal ? '_blank' : undefined)"
    :rel="props.rel ?? (isExternal ? 'noreferrer' : undefined)"
  >
    {{ text }}
  </component>
</template>

<style scoped>
.VPButton {
  display: inline-block;
  border: 1px solid transparent;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
}

.VPButton:active {
  transition: color 0.1s, border-color 0.1s, background-color 0.1s;
}

.VPButton.medium {
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
}

.VPButton.big {
  border-radius: 24px;
  padding: 0 24px;
  line-height: 46px;
  font-size: 16px;
}

.VPButton.brand {
  border-color: var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
}

.VPButton.brand:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

.VPButton.brand:active {
  border-color: var(--vp-button-brand-active-border);
  color: var(--vp-button-brand-active-text);
  background-color: var(--vp-button-brand-active-bg);
}

.VPButton.alt {
  border-color: var(--vp-button-alt-border);
  color: var(--vp-button-alt-text);
  background-color: var(--vp-button-alt-bg);
}

.VPButton.alt:hover {
  border-color: var(--vp-button-alt-hover-border);
  color: var(--vp-button-alt-hover-text);
  background-color: var(--vp-button-alt-hover-bg);
}

.VPButton.alt:active {
  border-color: var(--vp-button-alt-active-border);
  color: var(--vp-button-alt-active-text);
  background-color: var(--vp-button-alt-active-bg);
}

.VPButton.sponsor {
  border-color: var(--vp-button-sponsor-border);
  color: var(--vp-button-sponsor-text);
  background-color: var(--vp-button-sponsor-bg);
}

.VPButton.sponsor:hover {
  border-color: var(--vp-button-sponsor-hover-border);
  color: var(--vp-button-sponsor-hover-text);
  background-color: var(--vp-button-sponsor-hover-bg);
}

.VPButton.sponsor:active {
  border-color: var(--vp-button-sponsor-active-border);
  color: var(--vp-button-sponsor-active-text);
  background-color: var(--vp-button-sponsor-active-bg);
}
</style>