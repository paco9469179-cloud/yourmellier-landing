/** Strip HTML tags and trim; client-side guard before sending to APIs. */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}
