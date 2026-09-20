import { describe, expect, it, vi } from "vitest";
import { announceTimerVoice, playCountdownBeep } from "./audioTimer";

describe("audioTimer", () => {
  it("runs playCountdownBeep without throwing errors in Node/browser environments", () => {
    expect(() => playCountdownBeep(false)).not.toThrow();
    expect(() => playCountdownBeep(true)).not.toThrow();
  });

  it("handles announceTimerVoice gracefully when speechSynthesis is unavailable or mocked", () => {
    // In Vitest jsdom/node, speechSynthesis may not be defined or mocked
    const result = announceTimerVoice("Rest complete!");
    expect(typeof result).toBe("boolean");
  });

  it("triggers speak when window.speechSynthesis is mocked", () => {
    const speakMock = vi.fn();
    const cancelMock = vi.fn();

    // Mock window and speechSynthesis in globalThis for Node test environment
    const originalWindow = (globalThis as any).window;
    (globalThis as any).window = {
      speechSynthesis: {
        speak: speakMock,
        cancel: cancelMock,
      },
      SpeechSynthesisUtterance: function (this: any, text: string) {
        this.text = text;
      },
    };
    (globalThis as any).SpeechSynthesisUtterance = (globalThis as any).window.SpeechSynthesisUtterance;

    try {
      const spoken = announceTimerVoice("30 seconds remaining", { rate: 1.1 });
      expect(spoken).toBe(true);
      expect(cancelMock).toHaveBeenCalled();
      expect(speakMock).toHaveBeenCalled();
    } finally {
      (globalThis as any).window = originalWindow;
    }
  });
});
