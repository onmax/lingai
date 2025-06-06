export function useMarkdown(content: string): string {
  if (!content)
    return ''

  // Simple markdown to HTML conversion for basic cases
  return content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/gi, '')
    .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/gi, '$1')
}
