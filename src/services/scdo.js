// SCDO RPC client

const SHARDS = [
  { id: 1, rpc: 'http://74.208.207.184:8037' },
  { id: 2, rpc: 'http://74.208.207.184:8038' },
  { id: 3, rpc: 'http://74.208.207.184:8039' },
  { id: 4, rpc: 'http://74.208.207.184:8036' },
];

// Known token contracts
export const TOKENS = {
  AUDT: '1S01ecf66d7b027847e75c2b4425d6a805a5bc5261',
};

export function getShardFromAddress(address) {
  return parseInt(address.substring(0, 1));
}

export async function rpc(shardId, method, params = []) {
  const shard = SHARDS.find(s => s.id === shardId) || SHARDS[0];
  const res = await fetch(shard.rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

// getBalance and getAccountNonce require PUBLIC KEY (hex), not address
export async function getBalance(pubKey, address) {
  const shard = getShardFromAddress(address);
  const result = await rpc(shard, 'scdo_getBalance', [pubKey, '', -1]);
  const balance = result.Balance || 0;
  return (Number(balance) / 1e8).toFixed(8);
}

export async function getNonce(pubKey, address) {
  const shard = getShardFromAddress(address);
  return await rpc(shard, 'scdo_getAccountNonce', [pubKey, '', -1]);
}

// Call contract balanceOf for ERC20 tokens
export async function getTokenBalance(contractAddress, userAddress) {
  const shard = getShardFromAddress(contractAddress);
  const addrHex = userAddress.slice(2);
  const data = '0x70a08231' + addrHex.padStart(64, '0');
  try {
    const result = await rpc(shard, 'scdo_call', [contractAddress, data, -1]);
    if (!result.result || result.result === '0x') return 0;
    return parseInt(result.result, 16) / 1e8;
  } catch (e) { return 0; }
}
