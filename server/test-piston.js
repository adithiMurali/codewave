const axios = require('axios');

async function test() {
  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: 'python',
      version: '3.10.0',
      files: [{ content: 'print("Hello World")' }]
    }, {
      headers: {
        'Content-Type': 'application/json'
        // 'User-Agent': 'CodeWave/1.0'
      }
    });
    console.log("Success:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

test();
