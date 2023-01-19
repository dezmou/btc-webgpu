import sha256 from './sha256';
import './style.css'

;(async () => {
  const sha = await sha256(1024);
  const res  = await sha.hashString("chien")
  console.log(res);

  const res2  = await sha.hashString("lapin")
  console.log(res2);


})()