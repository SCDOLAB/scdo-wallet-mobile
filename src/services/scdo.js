// SCDO RPC client

const SHARDS = [
  { id: 1, rpc: 'http://74.208.207.184:8037' },
  { id: 2, rpc: 'http://74.208.207.184:8038' },
  { id: 3, rpc: 'http://74.208.207.184:8039' },
  { id: 4, rpc: 'http://74.208.207.184:8036' },
];

export function getShardFromAddress(address) {
  return parseInt(address.substring(0, 1));
}

async function rpc(shardId, method, params = []) {
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

export async function getBalance(address) {
  const shard = getShardFromAddress(address);
  const result = await rpc(shard, 'scdo_getBalance', [address, '', -1]);
  const balance = result.Balance || 0;
  return (Number(balance) / 1e8).toFixed(8);
}

export async function getNonce(address) {
  const shard = getShardFromAddress(address);
  return await rpc(shard, 'scdo_getAccountNonce', [address, '', -1]);
}

export async function getTransactions(address) {
  const shard = getShardFromAddress(address);
  const sent = await rpc(shard, 'scdo_getTransactionsFrom', [address, '', -1]);
  const received = await rpc(shard, 'scdo_getTransactionsTo', [address, '', -1]);
  return [...(sent || []), ...(received || [])];
}
