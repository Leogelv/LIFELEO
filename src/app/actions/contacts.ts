'use server'

export async function fetchChatHistory(userId: number) {
  if (!process.env.YANDEX_API_KEY) {
    throw new Error('YANDEX_API_KEY is not set in environment variables')
  }

  const response = await fetch(
    `https://functions.yandexcloud.net/d4em009uqs3tbu0k3ogl?chat_id=${userId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status} ${response.statusText}`)
  }

  return response.json()
} 