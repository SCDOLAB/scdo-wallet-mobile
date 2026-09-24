// SCDO RPC client - direct HTTP calls (no Node.js deps)

const SHARDS = [
  { id: 1, rpc: 'http://74.208.207.184:8037' },
  { id: 2, rpc: 'http://74.208.207.184:8038' },
  { id: 3, rpc: 'http://74.208.207.184:8039' },
  { id: 4, rpc: 'http://74.208.207.184:8036' },
];

// Get shard number from address like "1S0123..."
export function getShardFromAddress(address) {
  return parseInt(address.substring(0, 1));
}

// JSON-RPC call to a specific shard
async function rpc(shardId, method, params = []) {
  const shard = SHARDS.find(s => s.id === shardId) || SHARDS[0];
  const res = await fetch(shard.rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: 1,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

// Get balance in Wei
export async function getBalance(address) {
  const shard = getShardFromAddress(address);
  const bal = await rpc(shard, 'scdo_getBalance', [address, 'latest']);
  // Convert from Wei (1e18) to SCDO
  const wei = BigInt(bal);
  const scdo = Number(wei) / 1e18;
  return scdo.toFixed(4);
}

// Get nonce
export async function getNonce(address) {
  const shard = getShardFromAddress(address);
  return await rpc(shard, 'scdo_getTransactionCount', [address, 'pending']);
}

// Get chain ID
export async function getChainId() {
  return await rpc(1, 'scdo_chainId', []);
}
