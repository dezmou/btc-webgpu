import sha256 from './sha256';
import './style.css'

const BTC_HEADER = "0100000081cd02ab7e569e8bcd9317e2fe99f2de44d49ab2b8851ba4a308000000000000e320b6c2fffc8d750423db8b1eb942ae710e951ed797f7affc8892b0f1fc122bc7f5d74df2b9441a"
const NOUNCE = "42a14695"

;(async () => {
  const sha = await sha256(1024);
  const res  = await sha.hashHex(BTC_HEADER + NOUNCE)

  const res2  = await sha.hashHex(res)
  console.log(res2);

})()