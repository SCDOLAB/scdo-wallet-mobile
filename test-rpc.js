// Test SCDO RPC connectivity
const { keccak_256 } = require('js-sha3');

async function testRPC() {
  console.log('=== Testing SCDO RPC ===');
  
  // Test balance for known address
  const addr = '1S01719c9c8cb99a6c95b738d2cf21fc0a901';
  
  try {
    console.log('\n1. Balance query...');
    const res = await fetch('http://74.208.207.184:8037', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'scdo_getBalance',
        params: [addr, '', -1],
        id: 1
      })
    });
    const data = await res.json();
    if (data.result && data.result.Balance) {
      const bal = parseInt(data.result.Balance) / 1e8;
      console.log('   Balance:', bal.toFixed(8), 'SCDO');
    } else {
      console.log('   Result:', JSON.stringify(data.result));
    }
  } catch (e) {
    console.log('   Error:', e.message);
  }

  try {
    console.log('\n2. Nonce query...');
    const res = await fetch('http://74.208.207.184:8037', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'scdo_getAccountNonce',
        params: [addr, '', -1],
        id: 1
      })
    });
    const data = await res.json();
    console.log('   Nonce:', data.result);
  } catch (e) {
    console.log('   Error:', e.message);
  }

  try {
    console.log('\n3. Chain height query...');
    const res = await fetch('http://74.208.207.184:8037', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'scdo_blockNumber',
        params: [],
        id: 1
      })
    });
    const data = await res.json();
    console.log('   Block height:', data.result);
  } catch (e) {
    console.log('   Error:', e.message);
  }

  console.log('\n=== Done ===');
}

testRPC();
