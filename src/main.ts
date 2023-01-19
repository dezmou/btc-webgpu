import sha256 from './sha256';
import './style.css'

;(async () => {
  const sha = await sha256(1024);
  const res  = await sha.hash("chien")
  console.log(res);
  
})()