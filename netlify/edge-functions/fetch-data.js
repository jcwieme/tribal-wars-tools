const mapAlly = (lines) => {
  return lines.map((line) => {
    const [id, name, tag] = line.split(',')

    return {
      id: parseInt(id),
      name: decodeURIComponent(name.replace(/\+/g, ' ')),
      tag: decodeURIComponent(tag.replace(/\+/g, ' ')),
    }
  })
}

const mapPlayer = (lines) => {
  return lines.map((line) => {
    const [id, name, tribe_id] = line.split(',')

    return {
      id: parseInt(id),
      name: decodeURIComponent(name.replace(/\+/g, ' ')),
      tribe_id: parseInt(tribe_id),
    }
  })
}

export default async (req, res) => {
  const headers = {
    'Content-Type': 'application/json',
  }
  const passedValue = await new Response(req.body).text()
  const { type, url } = JSON.parse(passedValue)
  console.log('type', type)
  console.log('url', url)
  try {
    // Fetch the text file from the URL
    const response = await fetch(url)
    const textData = await response.text()

    // Split the text into lines
    const lines = textData.trim().split('\n')

    // Convert lines to JSON
    const jsonArray = type === 'ally' ? mapAlly(lines) : mapPlayer(lines)

    // Log the JSON result to the console
    return new Response(JSON.stringify(jsonArray), {
      status: 200,
      headers,
    })
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: error.status || 500,
      headers,
    })
  }
}

export const config = {
  path: '/web-api/fetch-data',
}
