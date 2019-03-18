const Blockchain = require('./blockchain');

const mycoin = new Blockchain();

// mycoin.createNewBlock(1234,'asbcvf','axsedcvf');
// mycoin.createNewTransaction(456,'asddff','cvbnm');
// mycoin.createNewBlock(1234,'asbcvf','axsedcvf');
// mycoin.createNewTransaction(456,'asddff','cvbnm');
// mycoin.createNewTransaction(156,'asddff','cvbnm');
// mycoin.createNewTransaction(1156,'asddff','cvbnm');
// mycoin.createNewBlock(1234,'asbcvf','axsedcvf');

// const blockData=[ 
//     { amount: 456, sender: 'asddff', recipient: 'cvbnm' },
//     { amount: 156, sender: 'asddff', recipient: 'cvbnm' },
//     { amount: 1156, sender: 'asddff', recipient: 'cvbnm' } ];

//console.log(mycoin.hashBlock('qwertyui',blockData,4455));
//console.log(mycoin.proofOfWork('qwertyui',blockData));

//console.log(mycoin);


const bc1={"chain":[{"index":1,"timestamp":1552911528771,"transactions":[],"nonce":100,"hash":"0","previousBlockHash":"0"},{"index":2,"timestamp":1552911563784,"transactions":[{"amount":77,"sender":"abcdbd","recipient":"avbcb","transactionId":"09a4cfd0497811e9be3a17f28fea734d"},{"amount":757,"sender":"abcdbd","recipient":"avbcb","transactionId":"0bbf9980497811e9be3a17f28fea734d"}],"nonce":17933,"hash":"0000aafee5fdc1898c83c026f43833cc7334e9a2987a93a62aae51823943efc0","previousBlockHash":"0"},{"index":3,"timestamp":1552911601922,"transactions":[{"amount":12.5,"sender":"00","recipient":"fbe78220497711e9be3a17f28fea734d","transactionId":"10c8d090497811e9be3a17f28fea734d"},{"amount":887,"sender":"abcdbd","recipient":"avbcb","transactionId":"1f647050497811e9be3a17f28fea734d"},{"amount":755,"sender":"abcdbd","recipient":"avbcb","transactionId":"22548b60497811e9be3a17f28fea734d"}],"nonce":25754,"hash":"000016e077a22c16fbba18d7531b94639a5292f6ab692355fb2069eb67f4057f","previousBlockHash":"0000aafee5fdc1898c83c026f43833cc7334e9a2987a93a62aae51823943efc0"}],"pendingTransaction":[{"amount":12.5,"sender":"00","recipient":"fbe78220497711e9be3a17f28fea734d","transactionId":"2781ec40497811e9be3a17f28fea734d"}],"currentNodeUrl":"http://localhost:3004","networkNodes":[]};
console.log(mycoin.chainIsValid(bc1.chain));