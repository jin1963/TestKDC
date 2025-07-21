
let web3;
let userAddress;
let stakingContract;
let kjcToken;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    document.getElementById("connectWallet").onclick = connectWallet;
    document.getElementById("stakeButton").onclick = stakeTokens;
  } else {
    alert("Please install MetaMask or Web3 Wallet");
  }
});

async function connectWallet() {
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  userAddress = accounts[0];
  stakingContract = new web3.eth.Contract(stakingABI, stakingContractAddress);
  kjcToken = new web3.eth.Contract([
    { "constant": false, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "type": "function" }
  ], kjcTokenAddress);
  document.getElementById("walletStatus").innerText = "✅ Connected: " + userAddress;
  loadStakes();
}

async function stakeTokens() {
  const amount = document.getElementById("stakeAmount").value;
  const lockDays = document.getElementById("lockPeriod").value;
  if (!amount || !lockDays) return alert("Enter amount and lock period");

  await kjcToken.methods.approve(stakingContractAddress, web3.utils.toWei(amount, "ether")).send({ from: userAddress });
  await stakingContract.methods.stake(web3.utils.toWei(amount, "ether"), lockDays).send({ from: userAddress });
  alert("✅ Staked successfully");
  loadStakes();
}

async function loadStakes() {
  const stakeCount = await stakingContract.methods.getStakeCount(userAddress).call();
  const container = document.getElementById("stakesContainer");
  container.innerHTML = "";

  for (let i = 0; i < stakeCount; i++) {
    const reward = await stakingContract.methods.pendingReward(userAddress, i).call();
    const stakeData = await stakingContract.methods.stakes(userAddress, i).call();
    const startDate = new Date(stakeData.startTime * 1000).toLocaleDateString();
    const unlockDate = new Date((+stakeData.startTime + +stakeData.lockPeriod) * 1000).toLocaleDateString();
    const status = stakeData.claimed ? "✅ Claimed" : (Date.now() / 1000 >= +stakeData.startTime + +stakeData.lockPeriod ? "🟢 Ready" : "🔒 Locked");

    const div = document.createElement("div");
    div.className = "stake-box";
    div.innerHTML = \`
      <p>Amount: \${web3.utils.fromWei(stakeData.amount)} KJC</p>
      <p>Start: \${startDate}</p>
      <p>Unlock: \${unlockDate}</p>
      <p>Reward: \${web3.utils.fromWei(reward)} KJC</p>
      <p>Status: \${status}</p>
      <button onclick="claim(\${i})">⛏️ Claim</button>
    \`;
    container.appendChild(div);
  }
}

async function claim(index) {
  try {
    await stakingContract.methods.claim(index).send({ from: userAddress });
    alert("✅ Claimed successfully");
    loadStakes();
  } catch (err) {
    alert("❌ Claim failed: " + err.message);
  }
}
