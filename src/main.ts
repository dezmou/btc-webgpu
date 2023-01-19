import sha256 from './sha256';
import './style.css'

;(async () => {
  const res = await sha256("chien");
  console.log(res);
})()