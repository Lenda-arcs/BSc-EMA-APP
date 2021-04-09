

export const fetchData = async (url, method, data = null, authToken = null) => {
    let response, headers, body

    if (authToken) headers = {'Content-Type': 'application/json', "Authorization": `Bearer ${authToken}`}
    else headers = {'Content-Type': 'application/json'}

    if (!data) body = null
    else body = JSON.stringify(data)

    response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    })
    if (!response.ok) {
        const errRes = await response.json()
        const errText = errRes.message
        throw new Error(errText)
    }
    return await response.json()

}
