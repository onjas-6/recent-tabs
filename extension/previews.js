// Created by GPT-6, Codex desktop, 2026-09-08. No network requests.
export const MAX_PREVIEW_BYTES = 5 * 1024 * 1024;
export const MAX_PREVIEW_COUNT = 30;

export function trimPreviews(cache, maxBytes = MAX_PREVIEW_BYTES, maxCount = MAX_PREVIEW_COUNT) {
  const entries = Object.entries(cache).filter(([, item]) =>
    typeof item?.data === 'string' && item.data.startsWith('data:image/jpeg;base64,'));
  entries.sort((a, b) => b[1].at - a[1].at);
  let bytes = 0;
  return Object.fromEntries(entries.filter(([, item], index) => {
    const size = item.data.length * 2 + (item.url?.length || 0) * 2 + 128;
    if (index >= maxCount || bytes + size > maxBytes) return false;
    bytes += size;
    return true;
  }));
}

export function previewBytes(cache) {
  return Object.values(cache).reduce((sum, item) => sum + item.data.length * 2, 0);
}

export async function shrinkScreenshot(data) {
  const image = await createImageBitmap(await (await fetch(data)).blob());
  try {
    const width = Math.min(480, image.width);
    const height = Math.round(image.height * width / image.width);
    const canvas = new OffscreenCanvas(width, height);
    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.62 });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return 'data:image/jpeg;base64,' + btoa(binary);
  } finally {
    image.close();
  }
}
