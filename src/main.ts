import sha256 from './sha256';
import './style.css'

const BTC_HEADER = "0100000081cd02ab7e569e8bcd9317e2fe99f2de44d49ab2b8851ba4a308000000000000e320b6c2fffc8d750423db8b1eb942ae710e951ed797f7affc8892b0f1fc122bc7f5d74df2b9441a"
// const NOUNCE = "42a14695"
const NOUNCE = "42a14600"
// const NOUNCE = "42b14600"

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

let numberHash = 0;

const chien = setInterval(() => {
  console.log(`${numberHash} hashs per second`);
  numberHash = 0;
}, 1000)
let found = false;

for (let nb_worker = 0; nb_worker < 10; nb_worker++) {
  ; (async () => {
    const sha = await sha256(1024);

    while(!found){
      const nounce = genRanHex(8);
      const res = await sha.hashHex(BTC_HEADER + nounce)
      numberHash += 256 * 2;
      if (res.index !== 0) {
        console.log("FOUND !", res);
        clearInterval(chien);
        found = true;
      }
    }
  })()
}
