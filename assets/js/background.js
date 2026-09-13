import { getVideoInfo } from "./modules/video-info.js";
import { downloadFile } from "./modules/downloads.js";
import {
  generateMP3Download,
  generateMP4Download,
  getDownloadStatus
} from "./modules/conversion.js";

const handlers = {
  "background.youtube-downloader.get-video-info": getVideoInfo,
  "background.download": downloadFile,
  "background.youtube-downloader.generate-mp3-download": generateMP3Download,
  "background.youtube-downloader.generate-mp4-download": generateMP4Download,
  "background.youtube-downloader.download-status": getDownloadStatus
};

browser.runtime.onMessage.addListener((message, sender) => {
  const handler = handlers[message?.type];
  if (!handler) return; // игнор

  return handler(message, sender)
    .then(data => ({ error: false, data }))
    .catch(error => ({
      error: true,
      errorMessage: error?.message || "An error occurred, Please try again."
    }));
});