const { test, expect } = require("@playwright/test");

const languages = [
  { code: "en", title: "Robolution 000 | Post-Human Archive Series", heading: "The first recoverable layer", book: "The physical book is published in English only." },
  { code: "fr", title: "Robolution 000 | Archives post-humaines", heading: "La première strate récupérable", book: "Le livre physique est publié uniquement en anglais." },
  { code: "es", title: "Robolution 000 | Archivo poshumano", heading: "La primera capa recuperable", book: "El libro físico se publica únicamente en inglés." },
  { code: "de", title: "Robolution 000 | Posthumanes Archiv", heading: "Die erste wiederherstellbare Schicht", book: "Das gedruckte Buch erscheint ausschließlich auf Englisch." },
  { code: "pt-BR", title: "Robolution 000 | Arquivo pós-humano", heading: "A primeira camada recuperável", book: "O livro físico é publicado exclusivamente em inglês." },
  { code: "ja", title: "Robolution 000 | ポスト・ヒューマン・アーカイヴ", heading: "復元可能な最初の地層", book: "紙の書籍は英語版のみ刊行される。" },
  { code: "ko", title: "Robolution 000 | 포스트휴먼 아카이브", heading: "복구 가능한 최초의 지층", book: "실물 도서는 영어판으로만 출간됩니다." },
  { code: "zh-CN", title: "Robolution 000｜后人类档案", heading: "首个可复原层", book: "实体书仅出版英文版。" }
];

test("the complete archive loads with every critical section", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(languages[0].title);
  await expect(page.locator(".track-card")).toHaveCount(9);
  await expect(page.locator(".track-play")).toHaveCount(9);
  await expect(page.locator(".listening-link")).toHaveCount(5);
  await expect(page.locator(".paper-list > li")).toHaveCount(9);
  await expect(page.locator("#archive, #tracks, #listen, #video, #papers, #object")).toHaveCount(6);

  await expect.poll(() => page.locator("img").evaluateAll((images) =>
    images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src)
  )).toEqual([]);
});

for (const language of languages) {
  test(`renders the complete ${language.code} locale`, async ({ page }) => {
    const suffix = language.code === "en" ? "" : `?lang=${encodeURIComponent(language.code)}`;
    await page.goto(`/${suffix}`);

    await expect(page.locator("html")).toHaveAttribute("lang", language.code);
    await expect(page.locator("#language-select")).toHaveValue(language.code);
    await expect(page).toHaveTitle(language.title);
    await expect(page.getByRole("heading", { name: language.heading })).toBeVisible();
    await expect(page.getByText(language.book, { exact: true })).toBeVisible();
  });
}

test("detects a Chinese browser locale automatically", async ({ browser }) => {
  const context = await browser.newContext({ locale: "zh-TW" });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("#language-select")).toHaveValue("zh-CN");
  await expect(page.getByRole("heading", { name: "首个可复原层" })).toBeVisible();

  await context.close();
});

test("falls back to English for an unsupported browser locale", async ({ browser }) => {
  const context = await browser.newContext({ locale: "it-IT" });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#language-select")).toHaveValue("en");

  await context.close();
});

test("persists a manual language choice and keeps the URL shareable", async ({ page }) => {
  await page.goto("/");
  await page.locator("#language-select").selectOption("zh-CN");

  await expect(page).toHaveURL(/\?lang=zh-CN$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.reload();
  await expect(page.locator("#language-select")).toHaveValue("zh-CN");
  await expect(page.getByRole("heading", { name: "首个可复原层" })).toBeVisible();
});

test("play and pause remain a minimal image overlay", async ({ page }) => {
  await page.route("**/assets/audio/**", (route) => route.fulfill({
    status: 200,
    contentType: "audio/mpeg",
    body: ""
  }));
  await page.addInitScript(() => {
    const states = new WeakMap();
    Object.defineProperty(HTMLMediaElement.prototype, "paused", {
      configurable: true,
      get() {
        return states.get(this) !== false;
      }
    });
    HTMLMediaElement.prototype.play = function play() {
      states.set(this, false);
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function pause() {
      states.set(this, true);
      this.dispatchEvent(new Event("pause"));
    };
  });
  await page.goto("/?lang=fr");

  const firstTrack = page.locator(".track-card").first();
  const button = firstTrack.locator(".track-play");
  await expect(button.locator(".play-symbol")).toHaveText("▶");
  await button.click();
  await expect(firstTrack).toHaveClass(/is-playing/);
  await expect(button.locator(".play-symbol")).toHaveText("❚❚");
  await expect(button).toHaveAttribute("aria-label", /^Pause piste:/);

  await button.click();
  await expect(firstTrack).not.toHaveClass(/is-playing/);
  await expect(button.locator(".play-symbol")).toHaveText("▶");
  await expect(page.locator("audio[controls]")).toHaveCount(0);
});

test("publishes the confirmed album, video, and Ethernet source links", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('.listening-link[href="https://open.spotify.com/album/3RAwkJVe3ySIF8QWiFH72n"]')).toHaveCount(1);
  await expect(page.locator('.listening-link[href="https://music.apple.com/ch/album/robolution-000/6804467913"]')).toHaveCount(1);
  await expect(page.locator('.listening-link[href^="https://music.youtube.com/playlist"]')).toHaveCount(1);
  await expect(page.locator('.listening-link[href="https://music.amazon.com/albums/B0HG829P65"]')).toHaveCount(1);
  await expect(page.locator('.listening-link[href="https://release.landr.com/991048816534"]')).toHaveCount(1);
  await expect(page.locator('.video-section a[href="https://youtu.be/4CbViQHohZI"]')).toHaveCount(1);
  await expect(page.locator('.paper-list a[href="https://www.cl.cam.ac.uk/teaching/0708/DigiCommI/metcalfe1976ethernet.pdf"]')).toHaveCount(1);

  for (const link of await page.locator('a[target="_blank"]').all()) {
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  }
});
