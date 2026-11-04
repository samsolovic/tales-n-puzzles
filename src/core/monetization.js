// Poki SDK adapter.
//
// Poki is the ad network and the source of ad revenue. Phaser is only the
// renderer. This module keeps the SDK behind one small surface so the game can
// run with a deterministic mock locally and with the real Poki SDK when it is
// served by Poki / the Poki Inspector.

const params = new URLSearchParams(window.location.search);
const pokiHost = /(^|\.)poki\.(com|dev)$/.test(window.location.hostname);
const explicitMock = params.get('mockAds') === '1';
const explicitReal = params.get('mockAds') === '0';
const forceMock = explicitMock || (!pokiHost && !explicitReal);
const mockAdFailure = params.get('mockAdFail') === '1';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

class Monetization {
  constructor() {
    this.sdk = null;
    this.ready = false;
    this.mock = forceMock;
    this.unavailable = false;
    this.busy = false;
    this.gameplayActive = false;
    this.loadingFinished = false;
    this.initPromise = null;
    this.commercialCount = 0;
    this.rewardedCount = 0;
  }

  get usingMock() {
    return this.mock;
  }

  isAvailable() {
    return this.ready && (this.mock || Boolean(this.sdk));
  }

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      if (forceMock) {
        this.mock = true;
        this.ready = true;
        console.info('[Poki] Mock ad mode. Use ?mockAds=0 to try the real SDK on a non-Poki host.');
        return;
      }

      const sdk = await this.waitForSdk(2500);
      if (!sdk) {
        this.mock = false;
        this.unavailable = true;
        this.ready = true;
        console.info('[Poki] SDK not found; ads disabled. Use ?mockAds=1 for local ad testing.');
        return;
      }

      try {
        await Promise.race([
          sdk.init(),
          wait(2500).then(() => { throw new Error('Poki SDK init timed out'); })
        ]);
        this.sdk = sdk;
        this.mock = false;
        this.unavailable = false;
        this.ready = true;
        console.info('[Poki] SDK initialized.');
      } catch (error) {
        this.sdk = null;
        this.mock = false;
        this.unavailable = true;
        this.ready = true;
        console.info('[Poki] SDK init failed; ads disabled.', error);
      }
    })();
    return this.initPromise;
  }

  async waitForSdk(timeout) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      if (window.PokiSDK) return window.PokiSDK;
      await wait(100);
    }
    return window.PokiSDK || null;
  }

  gameLoadingFinished() {
    this.loadingFinished = true;
    if (this.ready && this.sdk && !this.mock) {
      try {
        this.sdk.gameLoadingFinished();
        console.info('[Poki] gameLoadingFinished');
      } catch (error) {
        console.warn('[Poki] gameLoadingFinished failed', error);
      }
    }
  }

  gameplayStart() {
    if (this.gameplayActive) return;
    this.gameplayActive = true;
    if (this.ready && this.sdk && !this.mock) {
      try {
        this.sdk.gameplayStart();
      } catch (error) {
        console.warn('[Poki] gameplayStart failed', error);
      }
    }
  }

  gameplayStop() {
    if (!this.gameplayActive) return;
    this.gameplayActive = false;
    if (this.ready && this.sdk && !this.mock) {
      try {
        this.sdk.gameplayStop();
      } catch (error) {
        console.warn('[Poki] gameplayStop failed', error);
      }
    }
  }

  async commercialBreak(reason = 'chapter_boundary') {
    if (this.busy || !this.isAvailable()) return false;
    this.busy = true;
    this.commercialCount += 1;
    try {
      console.info('[Poki] commercialBreak:', reason);
      if (this.mock || !this.sdk) {
        await wait(900);
        return true;
      }
      await new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        try {
          this.sdk.commercialBreak(() => {}).then(finish).catch(finish);
        } catch (error) {
          console.warn('[Poki] commercialBreak failed', error);
          finish();
        }
        window.setTimeout(finish, 45000);
      });
      return true;
    } finally {
      this.busy = false;
    }
  }

  async rewardedBreak(reason = 'extra_hints') {
    if (this.busy || !this.isAvailable()) return false;
    this.busy = true;
    this.rewardedCount += 1;
    try {
      console.info('[Poki] rewardedBreak:', reason);
      if (this.mock || !this.sdk) {
        await wait(mockAdFailure ? 450 : 1200);
        return !mockAdFailure;
      }
      return await new Promise((resolve) => {
        let settled = false;
        const finish = (success) => {
          if (settled) return;
          settled = true;
          resolve(Boolean(success));
        };
        try {
          this.sdk.rewardedBreak(() => {})
            .then((success) => finish(success))
            .catch((error) => {
              console.warn('[Poki] rewardedBreak failed', error);
              finish(false);
            });
        } catch (error) {
          console.warn('[Poki] rewardedBreak failed', error);
          finish(false);
        }
        window.setTimeout(() => finish(false), 45000);
      });
    } finally {
      this.busy = false;
    }
  }

  isBusy() {
    return this.busy;
  }

  snapshot() {
    return {
      ready: this.ready,
      mock: this.mock,
      available: this.isAvailable(),
      unavailable: this.unavailable,
      busy: this.busy,
      gameplayActive: this.gameplayActive,
      commercialCount: this.commercialCount,
      rewardedCount: this.rewardedCount
    };
  }
}

export const monetization = new Monetization();
