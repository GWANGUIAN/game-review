import { describe, expect, it } from "vitest"; import { minutesLabel } from "../lib/utils";
describe("play duration", () => { it("formats combined hours and minutes", () => { expect(minutesLabel(450)).toBe("7시간 30분"); }); it("formats exact hours", () => { expect(minutesLabel(180)).toBe("3시간"); }); });
