const  express = require('express');
const  app =express();
const  bodyParser=require('body-parser');
const Blockchain=require('./blockchain');
const uuid = require('uuid/v1');

const nodeAddress = uuid().split('-').join('');

const mycoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//to get entire blockchain
app.get('/blockchain',function(req,res){
    res.send(mycoin);

});

//create a new transaction and add it to pendingTransaction list
app.post('/transaction',function(req,res){
  const blockIndex= mycoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
  res.json({node:blockIndex });

});

// mine a new block
app.get('/mine',function(req,res){
   
   const lastBlock = mycoin.getLastBlock();
   const previousBlockHash=lastBlock['hash'];

   const currentBlockData={
       transactions:mycoin.pendingTransaction,
       index:lastBlock['index'] + 1
   };
   const nonce = mycoin.proofOfWork(previousBlockHash,currentBlockData);

   const blockHash = mycoin.hashBlock(previousBlockHash,currentBlockData,nonce);

   mycoin.createNewTransaction(12.5,'00',nodeAddress);

   const newBlock=mycoin.createNewBlock(nonce,previousBlockHash,blockHash);

   res.json({
       "note":"New block mined successfully",
       "block": newBlock
   });
});

app.listen(3000,function(){
    console.log('Server running on port 3000');
});