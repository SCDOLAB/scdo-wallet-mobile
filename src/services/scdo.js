// SCDO network configuration
const NETWORKS = {
  shard1: 'http://74.208.207.184:8037',
  shard2: 'http://74.208.207.184:8038',
  shard3: 'http://74.208.207.184:8039',
  shard4: 'http://74.208.207.184:8036',
};

const SHARD_RPC = {
  1: NETWORKS.shard1,
  2: NETWORKS.shard2,
  3: NETWORKS.shard3,
  4: NETWORKS.shard4,
};

// Convert internal hex address to display format: "1S" + hex
export function toDisplayAddress(hexAddress, shardNum) {
  const clean = hexAddress.replace(/^0x/, '');
  return `${shardNum}S${clean}`;
}

// Convert display address to hex
export function fromDisplayAddress(displayAddr) {
  const match = displayAddr.match(/^([1-4])S([0-9a-fA-F]+)$/);
  if (!match) throw new Error('Invalid SCDO address');
  return {
    shard: parseInt(match[1]),
    hex: '0x' + match[2],
  };
}

// RPC call to SCDO node
async function rpcCall(host, method, params = []) {
  const response = await fetch(host, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: 1,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

// Get balance for an address on its shard
export async function getBalance(displayAddress) {
  const { shard, hex } = fromDisplayAddress(displayAddress);
  const rpc = SHARD_RPC[shard];
  return await rpcCall(rpc, 'getBalance', [hex]);
}

// Get account info
export async function getAccount(displayAddress) {
  const { shard, hex } = fromDisplayAddress(displayAddress);
  const rpc = SHARD_RPC[shard];
  return await rpcCall(rpc, 'getAccount', [hex]);
}

// Get transactions for an address
export async function getTransactions(displayAddress, flag = 2) {
  const { shard, hex } = fromDisplayAddress(displayAddress);
  const rpc = SHARD_RPC[shard];
  // filterBlockTx: height=-1 means latest, flag=1=from, flag=2=to
  return await rpcCall(rpc, 'filterBlockTx', [-1, hex, flag]);
}

// Get node info
export async function getNodeInfo() {
  return await rpcCall(SHARD_RPC[1], 'getInfo', []);
}

// Estimate gas
export async function estimateGas(rawTx) {
  const rpc = SHARD_RPC[rawTx.ShardID || 1];
  return await rpcCall(rpc, 'estimateGas', [rawTx]);
}

// Send raw signed transaction
export async function sendRawTx(signedTx) {
  // Determine which shard to send to (from address shard)
  const fromShard = signedTx.From ? parseInt(signedTx.From[0]) : 1;
  const rpc = SHARD_RPC[fromShard] || SHARD_RPC[1];
  return await rpcCall(rpc, 'sendTransaction', [signedTx]);
}

export { NETWORKS, SHARD_RPC };
