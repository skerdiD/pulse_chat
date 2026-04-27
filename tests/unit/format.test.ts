import { describe, expect, it } from "vitest";

import { formatRoomPreviewTime } from "@/lib/format";

describe("formatRoomPreviewTime", () => {
  it("uses the provided reference time for deterministic relative labels", () => {
    expect(
      formatRoomPreviewTime(
        "2026-04-27T15:54:00.000Z",
        "2026-04-27T16:00:00.000Z",
      ),
    ).toBe("6m");
  });

  it("returns an empty string for invalid reference dates", () => {
    expect(
      formatRoomPreviewTime(
        "2026-04-27T15:54:00.000Z",
        "not-a-valid-reference-date",
      ),
    ).toBe("");
  });
});
