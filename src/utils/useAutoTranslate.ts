/**
 * Yukti Marg - Seamless DOM & React Auto-Translator Hook
 * Supports two-way dynamic translation:
 * - When lang === 'hi': Converts all English words and sentences to authentic Hindi.
 * - When lang === 'en': Converts all Hindi letters/sentences back to English,
 *   EXCEPT "युक्ति मार्ग" in the heading (which remains in Hindi script).
 */

import { useEffect, useRef } from 'react';
import { translateText, translateHindiToEnglish, hasDevanagari } from './translations';

// WeakMaps to keep track of the original English text and attributes without memory leaks
const originalTextMap = new WeakMap<Node, string>();
const originalAttrMap = new WeakMap<Element, Record<string, string>>();

/**
 * Checks if a node should be ignored from translation (scripts, code, svg, canvas)
 */
function shouldIgnoreNode(node: Node): boolean {
  if (!node.parentElement) return true;
  const tag = node.parentElement.tagName.toUpperCase();
  if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(tag)) {
    return true;
  }
  // Ignore specific elements like SVG paths or captcha canvas
  if (node.parentElement.closest('svg') || node.parentElement.closest('canvas')) {
    return true;
  }
  return false;
}

/**
 * Checks if a node should keep its English text (e.g. "Yukti Marg" in heading)
 */
function isProtectedEnglish(node: Node): boolean {
  if (!node.parentElement) return false;
  if (node.parentElement.closest('[data-keep-english="true"]')) return true;
  if (node.parentElement.closest('#heading-yukti-marg-english')) return true;
  return false;
}

/**
 * Checks if a node is protected Hindi (specifically "युक्ति मार्ग" in the heading)
 * which must stay in Hindi even when English is selected.
 */
function isProtectedHindi(node: Node): boolean {
  if (!node.parentElement) return false;

  // Specific heading element for Yukti Marg Hindi
  if (node.parentElement.closest('#heading-yukti-marg-hindi')) {
    return true;
  }

  // If element or any ancestor has data-keep-hindi="true"
  if (node.parentElement.closest('[data-keep-hindi="true"]')) {
    return true;
  }

  // Language button for Hindi: keep "हिन्दी" so citizens know where to click
  if (node.parentElement.closest('#gov-header-lang-hi')) {
    return true;
  }

  return false;
}

/**
 * Translates a single text node to Hindi
 */
function translateTextNodeToHindi(node: Text) {
  if (shouldIgnoreNode(node)) return;

  // Keep English title if protected
  if (isProtectedEnglish(node)) {
    if (node.nodeValue !== 'Yukti Marg') {
      node.nodeValue = 'Yukti Marg';
    }
    return;
  }

  const currentVal = node.nodeValue || '';
  if (!currentVal.trim()) return;

  // If node has original stored, use it; otherwise store currentVal
  let original = originalTextMap.get(node);
  if (!original) {
    original = currentVal;
    originalTextMap.set(node, original);
  }

  // Translate original English to Hindi
  const translated = translateText(original);
  if (node.nodeValue !== translated) {
    node.nodeValue = translated;
  }
}

/**
 * Translates a single text node to English (except protected "युक्ति मार्ग" in heading)
 */
function translateTextNodeToEnglish(node: Text) {
  if (shouldIgnoreNode(node)) return;

  // Check if it's the protected English span in the heading
  if (isProtectedEnglish(node)) {
    if (node.nodeValue !== 'Yukti Marg') {
      node.nodeValue = 'Yukti Marg';
    }
    return;
  }

  // IMPORTANT: Respect user mandate: "except युक्ति मार्ग in heading"
  if (isProtectedHindi(node)) {
    return;
  }

  const currentVal = node.nodeValue || '';
  if (!currentVal.trim()) return;

  // 1. Try to restore original English if it was recorded and has no Hindi
  const original = originalTextMap.get(node);
  if (original && !hasDevanagari(original)) {
    if (node.nodeValue !== original) {
      node.nodeValue = original;
    }
    return;
  }

  // 2. If node still contains Devanagari characters, convert them to English
  if (hasDevanagari(currentVal)) {
    const englishText = translateHindiToEnglish(currentVal);
    if (node.nodeValue !== englishText) {
      node.nodeValue = englishText;
    }
  }
}

/**
 * Translates an element's attributes (placeholder, title) to Hindi
 */
function translateElementAttributesToHindi(el: Element) {
  if (['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(el.tagName.toUpperCase())) return;

  let savedAttrs = originalAttrMap.get(el);
  if (!savedAttrs) {
    savedAttrs = {};
    originalAttrMap.set(el, savedAttrs);
  }

  // Placeholder
  if (el.hasAttribute('placeholder')) {
    const ph = el.getAttribute('placeholder') || '';
    if (ph && !hasDevanagari(ph)) {
      if (!savedAttrs.placeholder) savedAttrs.placeholder = ph;
      const transPh = translateText(savedAttrs.placeholder);
      if (ph !== transPh) el.setAttribute('placeholder', transPh);
    }
  }

  // Title
  if (el.hasAttribute('title')) {
    const t = el.getAttribute('title') || '';
    if (t && !hasDevanagari(t)) {
      if (!savedAttrs.title) savedAttrs.title = t;
      const transTitle = translateText(savedAttrs.title);
      if (t !== transTitle) el.setAttribute('title', transTitle);
    }
  }
}

/**
 * Restores element's attributes to English
 */
function translateElementAttributesToEnglish(el: Element) {
  if (['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(el.tagName.toUpperCase())) return;
  if (el.closest('[data-keep-hindi="true"]')) return;

  const savedAttrs = originalAttrMap.get(el);

  // Placeholder
  if (el.hasAttribute('placeholder')) {
    const current = el.getAttribute('placeholder') || '';
    if (savedAttrs?.placeholder && !hasDevanagari(savedAttrs.placeholder)) {
      if (current !== savedAttrs.placeholder) el.setAttribute('placeholder', savedAttrs.placeholder);
    } else if (hasDevanagari(current)) {
      const en = translateHindiToEnglish(current);
      if (current !== en) el.setAttribute('placeholder', en);
    }
  }

  // Title
  if (el.hasAttribute('title')) {
    const current = el.getAttribute('title') || '';
    if (savedAttrs?.title && !hasDevanagari(savedAttrs.title)) {
      if (current !== savedAttrs.title) el.setAttribute('title', savedAttrs.title);
    } else if (hasDevanagari(current)) {
      const en = translateHindiToEnglish(current);
      if (current !== en) el.setAttribute('title', en);
    }
  }
}

/**
 * Recursively walks a DOM subtree to apply Hindi translation
 */
function walkAndTranslateToHindi(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNodeToHindi(root as Text);
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateElementAttributesToHindi(root as Element);
  }

  let child = root.firstChild;
  while (child) {
    walkAndTranslateToHindi(child);
    child = child.nextSibling;
  }
}

/**
 * Recursively walks a DOM subtree to apply English translation
 */
function walkAndTranslateToEnglish(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNodeToEnglish(root as Text);
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateElementAttributesToEnglish(root as Element);
  }

  let child = root.firstChild;
  while (child) {
    walkAndTranslateToEnglish(child);
    child = child.nextSibling;
  }
}

/**
 * Hook to automatically manage full application bilingual state:
 * - When lang === 'hi': translates all English to Hindi.
 * - When lang === 'en': translates all Hindi to English, except "युक्ति मार्ग" in the heading.
 */
export function useAutoTranslate(lang: 'en' | 'hi') {
  const isMutatingRef = useRef<boolean>(false);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Update HTML document lang attribute
    document.documentElement.lang = lang;

    const rootEl = document.getElementById('root') || document.body;

    // Disconnect any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // 1. Initial Pass
    isMutatingRef.current = true;
    try {
      if (lang === 'hi') {
        walkAndTranslateToHindi(rootEl);
      } else {
        walkAndTranslateToEnglish(rootEl);
      }
    } finally {
      isMutatingRef.current = false;
    }

    // 2. Set up MutationObserver for continuous dynamic translation
    const observer = new MutationObserver((mutations) => {
      if (isMutatingRef.current) return;

      isMutatingRef.current = true;
      try {
        for (const mutation of mutations) {
          if (mutation.type === 'characterData') {
            if (lang === 'hi') {
              translateTextNodeToHindi(mutation.target as Text);
            } else {
              translateTextNodeToEnglish(mutation.target as Text);
            }
          } else if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (lang === 'hi') {
                walkAndTranslateToHindi(node);
              } else {
                walkAndTranslateToEnglish(node);
              }
            });
          } else if (mutation.type === 'attributes' && mutation.target instanceof Element) {
            if (lang === 'hi') {
              translateElementAttributesToHindi(mutation.target);
            } else {
              translateElementAttributesToEnglish(mutation.target);
            }
          }
        }
      } catch (err) {
        console.warn('Translation observer warning:', err);
      } finally {
        isMutatingRef.current = false;
      }
    });

    observer.observe(rootEl, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title']
    });

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [lang]);
}
