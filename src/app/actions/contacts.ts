'use server'

export async function fetchChatHistory(userId: number) {
  const response = await fetch(
    `https://functions.yandexcloud.net/d4em009uqs3tbu0k3ogl?chat_id=${userId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': 'Api-Key AQVNwPYqs6YHWKQQ77Yi9VZZQPyLsQnOY0xYHhYL'
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status} ${response.statusText}`)
  }

  return response.json()
} 