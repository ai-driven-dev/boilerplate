import { afterEach, describe, it } from "node:test";
import { ValidationError, WebScrapingError } from "../../errors";
import { WebScraperService } from "../WebScraperService";

describe("WebScraperService", () => {
	// Store original fetch
	const originalFetch = global.fetch;

	// Clean up after each test
	afterEach(() => {
		jest.clearAllMocks();
		// Restore original fetch
		global.fetch = originalFetch;
	});

	describe("scrapeWebPage", () => {
		it("should throw ValidationError for invalid URL", async () => {
			await expect(
				WebScraperService.scrapeWebPage("not-a-url"),
			).rejects.toThrow(ValidationError);
		});

		it("should throw ValidationError for non-http/https URLs", async () => {
			await expect(
				WebScraperService.scrapeWebPage("ftp://example.com"),
			).rejects.toThrow(ValidationError);
		});

		it("should accept valid HTTP URLs", async () => {
			// Mock fetch to avoid actual network requests in tests
			global.fetch = jest.fn().mockResolvedValue({
				ok: true,
				text: () =>
					Promise.resolve(
						"<html><head><title>Test Page</title></head><body><p>Test content</p></body></html>",
					),
			});

			const result = await WebScraperService.scrapeWebPage(
				"https://example.com",
			);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.data!.title).toBe("Test Page");
			expect(result.data!.url).toBe("https://example.com");
		});

		it("should handle network errors gracefully", async () => {
			global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

			await expect(
				WebScraperService.scrapeWebPage("https://example.com"),
			).rejects.toThrow(WebScrapingError);
		});
	});
});
