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

console.log(mycoin);