import { faker } from "@faker-js/faker";

/**
 * Example factory for synthetic task titles. Extend with API-backed cleanup when a backend exists.
 */
export class TaskFactory {
  private createdTitles: string[] = [];

  build(overrides?: { title?: string }) {
    const title =
      overrides?.title ??
      faker.lorem.words({ min: 2, max: 6 });
    this.createdTitles.push(title);
    return { title };
  }

  async cleanup(): Promise<void> {
    this.createdTitles = [];
  }
}
