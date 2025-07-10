import { load } from "cheerio";
import { ValidationError, WebScrapingError } from "../errors";
import type { ServiceResponse, WebScrapingResult } from "../types";

export class WebScraperService {
	private static readonly USER_AGENT =
		"Mozilla/5.0 (compatible; AIDD-Discord-Bot/1.0)";

	public static async scrapeWebPage(
		url: string,
	): Promise<ServiceResponse<WebScrapingResult>> {
		try {
			if (!WebScraperService.isValidUrl(url)) {
				throw new ValidationError("Invalid URL format");
			}

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000);

			try {
				const response = await fetch(url, {
					headers: {
						"User-Agent": WebScraperService.USER_AGENT,
						Accept:
							"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
					},
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new WebScrapingError(
						`HTTP ${response.status}: ${response.statusText}`,
					);
				}

				const html = await response.text();
				const $ = load(html);

				const title = WebScraperService.extractTitle($);
				const description = WebScraperService.extractDescription($);

				return {
					success: true,
					data: {
						title,
						description,
						url,
					},
				};
			} catch (error) {
				clearTimeout(timeoutId);

				if (
					error instanceof ValidationError ||
					error instanceof WebScrapingError
				) {
					throw error;
				}

				throw new WebScrapingError(
					`Failed to scrape webpage: ${error instanceof Error ? error.message : "Unknown error"}`,
					error,
				);
			}
		} catch (error) {
			if (
				error instanceof ValidationError ||
				error instanceof WebScrapingError
			) {
				throw error;
			}

			throw new WebScrapingError(
				`Failed to scrape webpage: ${error instanceof Error ? error.message : "Unknown error"}`,
				error,
			);
		}
	}

	private static isValidUrl(url: string): boolean {
		try {
			const urlObj = new URL(url);
			return urlObj.protocol === "http:" || urlObj.protocol === "https:";
		} catch {
			return false;
		}
	}

	private static extractTitle($: any): string {
		const title =
			$("title").text().trim() ||
			$('meta[property="og:title"]').attr("content") ||
			$('meta[name="twitter:title"]').attr("content") ||
			$("h1").first().text().trim() ||
			"Untitled";

		return title.substring(0, 200);
	}

	private static extractDescription($: any): string {
		const description =
			$('meta[name="description"]').attr("content") ||
			$('meta[property="og:description"]').attr("content") ||
			$('meta[name="twitter:description"]').attr("content") ||
			$("p").first().text().trim() ||
			"No description available";

		return description.substring(0, 500);
	}
}
