(async () => {
  try {
    const res = await fetch('http://localhost:3000/test-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dev-bypass': 'true',
        'x-dev-user-id': 'devtest'
      },
      body: JSON.stringify({ prompt: 'Generate 3 blog titles about AI and healthcare' })
    });
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Request error:', err);
  }
})();
