
let web3;
let contract;
let token;
let user;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    token = new web3.eth.Contract(erc20ABI, tokenAddress);
    contract = new web3.eth.Contract(stakingABI, contractAddress);
  } else {
    alert("⚠️ No Web3 provider found. Please use MetaMask or Bitget.");
    return;
  }

  document.getElementById("connectWallet").addEventListener("click", connectWallet);
  document.getElementById("stakeButton").addEventListener("click", stakeTokens);
});

async function connectWallet() {
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    user = accounts[0];

    const currentChainId = await ethereum.request({ method: "eth_chainId" });
    if (parseInt(currentChainId, 16) !== chainId) {
      alert("Please switch to Binance Smart Chain (Mainnet)");
      return;
    }

    document.getElementById("status").innerHTML = `✅ Connected:<br>${user}`;
    loadStakes();
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "❌ Connection failed.";
  }
}

async function stakeTokens() {
  const amount = document.getElementById("stakeAmount").value;
  const tier = document.getElementById("stakeTier").value;
  if (!amount || amount <= 0) return alert("Enter amount to stake");

  const decimals = await token.methods.decimals().call();
  const stakeAmount = web3.utils.toBN(amount * (10 ** decimals));

  await token.methods.approve(contractAddress, stakeAmount).send({ from: user });
  await contract.methods.stake(stakeAmount, tier).send({ from: user });

  alert("✅ Staked successfully");
  loadStakes();
}

async function loadStakes() {
  const container = document.getElementById("stakesContainer");
  container.innerHTML = "";

  let index = 0;
  while (true) {
    try {
      const stake = await contract.methods.stakes(user, index).call();
      if (stake.amount == 0) break;

      const now = Math.floor(Date.now() / 1000);
      const amount = web3.utils.fromWei(stake.amount, "ether");
      const start = new Date(stake.startTime * 1000).toLocaleDateString("en-GB");
      const end = new Date((parseInt(stake.startTime) + parseInt(stake.lockPeriod)) * 1000).toLocaleDateString("en-GB");

      const card = document.createElement("div");
      card.className = "stake-item";
      card.innerHTML = `
        <p><strong>Amount:</strong> ${amount} KJC</p>
        <p><strong>Start:</strong> ${start}</p>
        <p><strong>Unlock:</strong> ${end}</p>
        <p><strong>Status:</strong> ${stake.claimed ? "✅ Claimed" : "🔒 Locked"}</p>
      `;

      const claimable = now - stake.lastClaimTime >= 15 * 86400;
      const canUnstake = now >= parseInt(stake.startTime) + parseInt(stake.lockPeriod);

      if (!stake.claimed && claimable) {
        const claimBtn = document.createElement("button");
        claimBtn.innerText = "Claim Reward";
        claimBtn.onclick = async () => {
          await contract.methods.claim(index).send({ from: user });
          alert("✅ Claimed");
          loadStakes();
        };
        card.appendChild(claimBtn);
      }

      if (!stake.claimed && canUnstake) {
        const unstakeBtn = document.createElement("button");
        unstakeBtn.innerText = "Unstake";
        unstakeBtn.onclick = async () => {
          await contract.methods.unstake(index).send({ from: user });
          alert("✅ Unstaked");
          loadStakes();
        };
        card.appendChild(unstakeBtn);
      }

      container.appendChild(card);
      index++;
    } catch (e) {
      if (index === 0) container.innerText = "Failed to load stakes.";
      break;
    }
  }
}
