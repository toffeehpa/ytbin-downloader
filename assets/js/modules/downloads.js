export async function downloadFile({ filename, url }) {
  if (!url) {
    throw new Error("An error occurred, Please try again.");
  }

  const downloadId = await browser.downloads.download({
    url,
    filename,
    saveAs: false
  });

  return { downloadId };
}