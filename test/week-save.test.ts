import { describe, expect, it, vi } from "vitest";
import { emptyProgress } from "../lib/types";
import { createWeekSaveController } from "../lib/week-save";

describe("week save controller", () => {
  it("retains an immutable draft after a rejected write and retries that exact payload", async () => {
    const writes: string[] = [];
    let rejectWrite = true;
    const writer = vi.fn(async (value: ReturnType<typeof emptyProgress>) => {
      writes.push(JSON.stringify(value));
      if (rejectWrite) throw new Error("Firestore rejected the write");
    });
    const controller = createWeekSaveController(writer);
    const draft = emptyProgress("week-1");
    draft.notes.mechanism = "The controller closes the loop.";

    await expect(controller.save(draft)).rejects.toThrow("Firestore rejected");
    expect(controller.hasPending()).toBe(true);
    draft.notes.mechanism = "A later edit must not rewrite the pending retry.";
    rejectWrite = false;

    await controller.retry();
    expect(controller.hasPending()).toBe(false);
    expect(writer).toHaveBeenCalledTimes(2);
    expect(writes[1]).toBe(writes[0]);
    expect(JSON.parse(writes[1]).notes.mechanism).toBe("The controller closes the loop.");
  });

  it("keeps a pending payload through an offline failure", async () => {
    let online = false;
    const writer = vi.fn(async () => {
      if (!online) throw new Error("offline");
    });
    const controller = createWeekSaveController(writer);

    await expect(controller.save(emptyProgress("week-2"))).rejects.toThrow("offline");
    expect(controller.hasPending()).toBe(true);
    online = true;
    await controller.retry();
    expect(controller.hasPending()).toBe(false);
    expect(writer).toHaveBeenCalledTimes(2);
  });

  it("keeps retries scoped to their own week rather than a shared last write", async () => {
    const writes: string[] = [];
    let rejectWeekOne = true;
    const writer = vi.fn(async (value: ReturnType<typeof emptyProgress>) => {
      writes.push(value.weekId);
      if (value.weekId === "week-1" && rejectWeekOne) throw new Error("week one failed");
    });
    const weekOne = createWeekSaveController(writer);
    const weekTwo = createWeekSaveController(writer);

    await expect(weekOne.save(emptyProgress("week-1"))).rejects.toThrow();
    await weekTwo.save(emptyProgress("week-2"));
    rejectWeekOne = false;
    await weekOne.retry();

    expect(writes).toEqual(["week-1", "week-2", "week-1"]);
  });
});
