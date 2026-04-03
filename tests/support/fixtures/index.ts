import { mergeTests } from "@playwright/test";
import { test as baseFixtures } from "./base";

/** Single merge point for future fixture modules (e.g. auth, API). */
export const test = mergeTests(baseFixtures);

export { expect } from "@playwright/test";
