import { chromium } from 'playwright';

const URL = 'http://localhost:9191/';
const OUT_DIR = 'c:\\dev\\projects\\math-tutor-app\\e2e-screenshots';

async function captureAt(width, height, filename) {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chromium',
    timeout: 60000,
  });
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  // small settle for fonts/animations
  await page.waitForTimeout(500);

  const filePath = `${OUT_DIR}\\${filename}`;
  await page.screenshot({ path: filePath, fullPage: false });

  const data = await page.evaluate(() => {
    const sel = (s) => document.querySelector(s);
    const all = (s) => Array.from(document.querySelectorAll(s));
    const rectOf = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };

    const lanes = {
      addition: sel('[data-testid="lane-addition"]'),
      subtraction: sel('[data-testid="lane-subtraction"]'),
      multiplication: sel('[data-testid="lane-multiplication"]'),
    };

    const laneInfo = {};
    for (const [k, el] of Object.entries(lanes)) {
      const rect = rectOf(el);
      const lessons = el ? Array.from(el.querySelectorAll('[data-testid^="lesson-link-"]')) : [];
      const lessonRects = lessons.map(l => rectOf(l));
      const lessonsOverflowing = el && rect
        ? lessonRects.filter(r => r && r.right > rect.right + 0.5).length
        : 0;
      laneInfo[k] = {
        rect,
        lessonCount: lessons.length,
        lessonsOverflowing,
        firstLessonRect: lessonRects[0] || null,
        lastLessonRect: lessonRects[lessonRects.length - 1] || null,
      };
    }

    const totalLessonLinks = all('[data-testid^="lesson-link-"]').length;

    const doc = document.documentElement;
    const overflow = {
      scrollWidth: doc.scrollWidth,
      scrollHeight: doc.scrollHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      hasHorizontalOverflow: doc.scrollWidth > window.innerWidth,
      hasVerticalOverflow: doc.scrollHeight > window.innerHeight,
    };

    // probe a mascot if present
    const mascotCandidates = [
      '[data-testid="mascot"]',
      '[data-testid="mascot-cat"]',
      '.mascot',
      'img[alt*="mascot" i]',
      'img[alt*="cat" i]',
      'svg[aria-label*="cat" i]',
    ];
    let mascot = null;
    for (const s of mascotCandidates) {
      const m = sel(s);
      if (m) { mascot = { selector: s, rect: rectOf(m) }; break; }
    }

    // header probe
    const header = sel('header') || sel('[data-testid="header"]');
    const starCounter = sel('[data-testid="star-counter"]');

    return {
      overflow,
      lanes: laneInfo,
      totalLessonLinks,
      mascot,
      headerText: header ? header.innerText : null,
      starCounterText: starCounter ? starCounter.innerText : null,
      title: document.title,
    };
  });

  await browser.close();
  return { filePath, data };
}

const results = {};
results['1900x1136'] = await captureAt(1900, 1136, 'home-new-1900.png');
results['1280x800'] = await captureAt(1280, 800, 'home-new-1280.png');

console.log(JSON.stringify(results, null, 2));
