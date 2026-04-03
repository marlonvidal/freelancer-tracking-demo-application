import { test as base } from "@playwright/test";
import { TaskFactory } from "./factories/task-factory";

export const test = base.extend<{ taskFactory: TaskFactory }>({
  // Playwright requires object destructuring for fixture dependencies (none here).
  // eslint-disable-next-line no-empty-pattern
  taskFactory: async ({}, provide) => {
    const factory = new TaskFactory();
    await provide(factory);
    await factory.cleanup();
  },
});
