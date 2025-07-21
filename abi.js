
const stakingABI = [
  { "inputs": [{"internalType": "address", "name": "_kjcToken", "type": "address"}], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint256", "name": "tierDays", "type": "uint256"}], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType": "address", "name": "user", "type": "address"}], "name": "getStakeCount", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "uint256", "name": "index", "type": "uint256"}], "name": "pendingReward", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" }
];
