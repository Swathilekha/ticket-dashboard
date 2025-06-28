export async function getReasonFromOllama(prompt) {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false
    })
  })

  const result = await res.json()
  return result.response?.trim() || 'Unable to fetch explanation.'
}
