import { getChallenge, BotGuardClient } from "../vendor/bgutils/exports/botguard.js";
import { WebPoMinter } from "../vendor/bgutils/exports/webpo.js";
import { buildURL, getHeaders } from "../vendor/bgutils/exports/utils.js";

const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo";
const MINTER_TTL_MS = 30 * 60 * 1000;

let cachedMinter = null;
let mintedAt = 0;

async function loadInterpreter(challenge) {
  const inlineScript = challenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;
  if (inlineScript) {
    new Function(inlineScript)();
    return;
  }

  const rawUrl = challenge.interpreterUrl?.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue;
  if (!rawUrl) throw new Error("BotGuard challenge has no interpreter script or URL");

  const res = await fetch(rawUrl.startsWith("http") ? rawUrl : `https:${rawUrl}`);
  new Function(await res.text())();
}

async function buildMinter() {
  const challenge = await getChallenge({
    requestKey: REQUEST_KEY,
    fetchFunction: (...args) => fetch(...args),
    useYouTubeAPI: true
  });

  await loadInterpreter(challenge);

  const client = await BotGuardClient.create({
    program: challenge.program,
    globalName: challenge.globalName,
    globalObject: globalThis
  });

  const webPoSignalOutput = [];
  const snapshot = await client.snapshot({ webPoSignalOutput });

  const response = await fetch(buildURL("GenerateIT", true), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify([REQUEST_KEY, snapshot])
  });

  const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] = await response.json();

  cachedMinter = await WebPoMinter.create(
    { integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken },
    webPoSignalOutput
  );
  mintedAt = Date.now();
}

export async function getPoToken(contentBinding) {
  if (!cachedMinter || Date.now() - mintedAt >= MINTER_TTL_MS) {
    await buildMinter();
  }
  return cachedMinter.mintAsWebsafeString(contentBinding);
}