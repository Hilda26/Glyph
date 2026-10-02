import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const origin = process.env.GLYPHWORK_WALKTHROUGH_ORIGIN ?? "https://glyph-lake.vercel.app";
const outDir = resolve("artifacts");
const shotDir = resolve(outDir, "walkthrough-shots");
const outFile = resolve(outDir, "glyph-walkthrough.webm");

mkdirSync(shotDir, { recursive: true });

const slides = [
  { path: "/", title: "Glyphwork", caption: "A GenLayer Studionet app for verified archival transcription bounties." },
  { path: "/tasks", title: "Browse folios", caption: "Open live or fixture folios, inspect status, reward, and source evidence." },
  { path: "/t/1", title: "Review the bounty", caption: "Sponsors bind source hash, reward, rules, and minor-error policy on-chain." },
  { path: "/t/1/transcribe", title: "Submit with rules visible", caption: "Workers see binding transcription rules and configured fields before submitting." },
  { path: "/submission/1", title: "Read the receipt", caption: "Receipts show consensus findings and actual Vault payout or refund state." },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });

for (let index = 0; index < slides.length; index += 1) {
  const slide = slides[index];
  await page.goto(`${origin}${slide.path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: resolve(shotDir, `${String(index + 1).padStart(2, "0")}.png`) });
}

await browser.close();

const images = slides.map((slide, index) => ({
  ...slide,
  dataUrl: `data:image/png;base64,${readFileSync(resolve(shotDir, `${String(index + 1).padStart(2, "0")}.png`)).toString("base64")}`,
}));

const recorder = await chromium.launch();
const recordPage = await recorder.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await recordPage.setContent("<html><body style='margin:0;background:#191714'><canvas id='stage' width='1280' height='720'></canvas></body></html>");

const webm = await recordPage.evaluate(async (slidesForBrowser) => {
  const canvas = document.querySelector("canvas");
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Missing canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Missing 2d context");

  const loaded = await Promise.all(slidesForBrowser.map((slide) => new Promise((resolveImage, reject) => {
    const image = new Image();
    image.onload = () => resolveImage({ ...slide, image });
    image.onerror = reject;
    image.src = slide.dataUrl;
  })));

  const audio = new AudioContext();
  const destination = audio.createMediaStreamDestination();
  const master = audio.createGain();
  master.gain.value = 0.025;
  master.connect(destination);
  for (const [frequency, gainValue] of [[196, 0.4], [246.94, 0.25], [329.63, 0.16]]) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
  }

  const videoStream = canvas.captureStream(30);
  const stream = new MediaStream([...videoStream.getVideoTracks(), ...destination.stream.getAudioTracks()]);
  const chunks = [];
  const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const durationPerSlide = 4700;
  const totalDuration = loaded.length * durationPerSlide;
  const started = performance.now();

  function draw() {
    const elapsed = performance.now() - started;
    const slideIndex = Math.min(loaded.length - 1, Math.floor(elapsed / durationPerSlide));
    const local = (elapsed % durationPerSlide) / durationPerSlide;
    const slide = loaded[slideIndex];
    const zoom = 1 + local * 0.025;
    const width = canvas.width * zoom;
    const height = canvas.height * zoom;
    const x = -(width - canvas.width) * 0.5;
    const y = -(height - canvas.height) * 0.5;

    ctx.fillStyle = "#191714";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.drawImage(slide.image, x, y, width, height);
    ctx.fillStyle = "rgba(25, 23, 20, 0.72)";
    ctx.fillRect(0, 548, canvas.width, 172);
    ctx.fillStyle = "#EFE4CF";
    ctx.font = "700 44px Georgia, serif";
    ctx.fillText(slide.title, 48, 612);
    ctx.font = "24px Arial, sans-serif";
    ctx.fillText(slide.caption, 50, 660);
    ctx.fillStyle = "#AD8A50";
    ctx.fillRect(48, 684, (canvas.width - 96) * Math.min(1, elapsed / totalDuration), 6);

    if (elapsed < totalDuration) requestAnimationFrame(draw);
  }

  recorder.start(250);
  draw();
  await new Promise((resolve) => setTimeout(resolve, totalDuration + 500));
  recorder.stop();
  await new Promise((resolve) => { recorder.onstop = resolve; });
  await audio.close();
  const blob = new Blob(chunks, { type: "video/webm" });
  return Array.from(new Uint8Array(await blob.arrayBuffer()));
}, images);

await recorder.close();
writeFileSync(outFile, Buffer.from(webm));
console.log(outFile);
