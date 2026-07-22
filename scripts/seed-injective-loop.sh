#!/usr/bin/env bash
ADDR=0x26129909CFEA99D0c5D17d93090B8D36179C96d3
RPC=https://k8s.testnet.json-rpc.injective.network/
for attempt in $(seq 1 20); do
  # check current nextSkillId
  cur=""
  for j in 1 2 3 4 5; do
    r=$(curl -s -m 15 -X POST "$RPC" -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"'$ADDR'","data":"0x34306d25"},"latest"],"id":1}' 2>/dev/null)
    hex=$(echo "$r" | grep -o '"result":"0x[^"]*"' | cut -d'"' -f4)
    if [ -n "$hex" ]; then cur=$((16#${hex#0x})); break; fi
    sleep 2
  done
  echo "=== attempt $attempt: nextSkillId=$cur ==="
  if [ "$cur" = "12" ]; then echo "ALL 12 REGISTERED"; exit 0; fi
  ORCHOR_ADDRESS=$ADDR npx hardhat run scripts/seed-injective.ts --network injectiveTestnet 2>&1 | grep -E "confirmed|sent|skip|Final|Already|registered" || true
  sleep 2
done
echo "loop finished without confirming all 12"
exit 1
