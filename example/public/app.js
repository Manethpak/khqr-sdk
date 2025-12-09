// Helper function to handle form submission
function handleForm(formId, endpoint) {
  document.getElementById(formId).addEventListener('submit', async (e) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)
    const data = {}

    formData.forEach((value, key) => {
      if (value !== '') {
        // Handle nested objects for deeplink
        if (
          formId === 'generate-deeplink-form' &&
          ['appIconUrl', 'appName', 'appDeepLinkCallback'].includes(key)
        ) {
          if (!data.sourceInfo) data.sourceInfo = {}
          data.sourceInfo[key] = value
        } else if (key === 'amount' && value !== '') {
          data[key] = parseFloat(value)
        } else {
          data[key] = value
        }
      }
    })

    const resultEl = document.getElementById(formId.replace('-form', '-result'))

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (result.error) {
        resultEl.className = 'result show error'
        resultEl.textContent = JSON.stringify(result.error, null, 2)
      } else {
        resultEl.className = 'result show success'
        resultEl.textContent = JSON.stringify(result.data, null, 2)
      }
    } catch (error) {
      resultEl.className = 'result show error'
      resultEl.textContent = 'Error: ' + error.message
    }
  })
}

// Register all form handlers
handleForm('static-qr-form', '/api/qr/generate-static')
handleForm('dynamic-qr-form', '/api/qr/generate-dynamic')
handleForm('merchant-qr-form', '/api/qr/generate-merchant')
handleForm('decode-qr-form', '/api/qr/decode')
handleForm('verify-qr-form', '/api/qr/verify')
handleForm('check-account-form', '/api/bakong/check-account')
handleForm('check-tx-md5-form', '/api/bakong/check-transaction-md5')
handleForm('generate-deeplink-form', '/api/bakong/generate-deeplink')
