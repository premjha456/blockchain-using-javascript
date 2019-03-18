const  express = require('express');
const  app =express();
const  bodyParser=require('body-parser');
const  Blockchain=require('./blockchain');
const  uuid = require('uuid/v1');
const  rp=require('request-promise');

const nodeAddress = uuid().split('-').join('');

const port =process.argv[2];

const mycoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//to get entire blockchain
app.get('/blockchain',function(req,res){
    res.send(mycoin);

});


//add the broadcast transactions to the nodes individully
app.post('/transaction',function(req,res){

  const newTransaction = req.body;
  const blockIndex= mycoin.addTransactionToPendingTransaction(newTransaction);
  res.json({
      note:`Transaction will be added in block ${blockIndex}`
  });

});

//create a new transaction ,add it to pendingTransaction list and broadcast it to other nodes
app.post('/transaction/broadcast' ,function(req,res){
    const newTransaction = mycoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
    mycoin.addTransactionToPendingTransaction(newTransaction);
    
    const requestPromises =[];
    mycoin.networkNodes.forEach(networkNodeUrl=>{
         const requestOptions={
          uri:networkNodeUrl+'/transaction',
          method:'POST',
          body:newTransaction,
          json:true
         };

          requestPromises.push(rp(requestOptions));

    });

    Promise.all(requestPromises)
     .then(data=>{
         res.json({note:'Transaction Successful and broadcasted'});
     });
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

   const newBlock=mycoin.createNewBlock(nonce,previousBlockHash,blockHash);

   const requestPromises =[];

   mycoin.networkNodes.forEach(networkNodeUrl=>{
        
        const requestOptions ={
        uri:networkNodeUrl+'/recieve-new-block',
        method:'POST',
        body:{newBlock:newBlock},
        json:true
        };
         requestPromises.push(rp(requestOptions));
   });
    
   Promise.all(requestPromises)
   .then(data=>{
       const requestOptions ={
          uri:mycoin.currentNodeUrl +'/transaction/broadcast',
          method:'POST',
          body:{
              amount: 12.5,
              sender:'00',
              recipient:nodeAddress
          },
          json:true
       };

       return rp(requestOptions);
   })
   .then(data=>{
    res.json({
        "note":"New block mined  and broadcasted successfully",
        "block": newBlock
    });

   });
   
});


app.post('/recieve-new-block',function(req,res){

    const newBlock = req.body.newBlock;
    const lastBlock = mycoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index']+1 === newBlock['index'] ;

    if(correctHash && correctIndex){
      mycoin.chain.push(newBlock);
      mycoin.pendingTransaction=[];
      res.json({
          'note':'New block mined and accepted',
          'block':newBlock
      });
    }
    else{
        res.json({
            'note':'New block rejected',
            'block':newBlock
        });
    }
});

//register a node and broadcast it to network
app.post('/register-and-broadcast-node',function(req,res){

const newNodeUrl=req.body.newNodeUrl;

if(mycoin.networkNodes.indexOf(newNodeUrl)==-1){
    mycoin.networkNodes.push(newNodeUrl);
}

const regNodesPromises=[];
mycoin.networkNodes.forEach(networkNodeUrl =>{
    const requestOptions ={
     uri:networkNodeUrl+'/register-node',
     method:'POST',
     body:{newNodeUrl:newNodeUrl},
     json:true
    };

     regNodesPromises.push(rp(requestOptions));
});

Promise.all(regNodesPromises).then(data=>{
  const blukRegisterOptions={
      uri:newNodeUrl+'/register-nodes-bluk',
      method:'POST',
      body:{allNetworkNodes:[ ...mycoin.networkNodes,mycoin.currentNodeUrl]},
      json:true
  };
    return  rp(blukRegisterOptions);
})
.then(data=>{
    res.json({mesg:'New node registered with network successfully'});
});
});

//register a node with network
app.post('/register-node',function(req,res){

    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent=mycoin.networkNodes.indexOf(newNodeUrl)==-1;
    const notCurrentNode=mycoin.currentNodeUrl !== newNodeUrl;

    if(nodeNotAlreadyPresent && notCurrentNode){
        mycoin.networkNodes.push(newNodeUrl);
    }

    res.json({note:'New node registered'});
});

//register multiple nodes at bulk
app.post('/register-nodes-bluk',function(req,res){

    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl=>{
     
     const nodeNotAlreadyPresent=mycoin.networkNodes.indexOf(networkNodeUrl)==-1;
    const notCurrentNode=mycoin.currentNodeUrl !== networkNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode){
     mycoin.networkNodes.push(networkNodeUrl);
    }
    });

    res.json({
        note:'Bulk registration successfully'
    })
});

app.get('/consensus',function(req,res){
    
    const requestPromises=[];

    mycoin.networkNodes.forEach(networkNodeUrl=>{
     const requestOptions ={
         uri:networkNodeUrl+'/blockchain',
         method:'GET',
         json:true
     };
      requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(blockchains =>{
       const currentChainLength = mycoin.chain.length;
       let maxChainLength=null;
       let newLongestChain = null;
       let newPendingTransactions= null;

       blockchains.forEach(blockchain=>{
         if(blockchain.chain.length > maxChainLength){
             maxChainLength=blockchain.chain.length;
             newLongestChain=blockchain.chain;
             newPendingTransactions = blockchain.pendingTransaction;
         };

       });
        if(!newLongestChain || (newLongestChain && !mycoin.chainIsValid(newLongestChain))){
            res.json({
                note:'Current chain has not been replaced',
                chain:mycoin.chain
            });
        }
        else if(newLongestChain && mycoin.chainIsValid(newLongestChain)){

            mycoin.chain = newLongestChain;
            mycoin.pendingTransaction = newPendingTransactions; 
            res.json({
                note:'Current chain has been replaced',
                chain:mycoin.chain
            });
        }
    });
});


app.get('/block/:blockHash',function(req,res){
  
    const blockHash = req.params.blockHash;
    const correctBlock= mycoin.getBlock(blockHash);

    res.json({
        block:correctBlock
    });
});

app.get('/transaction/:transactionId',function(req,res){

    const transactionId = req.params.transactionId;
    const transactionData= mycoin.getTransaction(transactionId);

    res.json({
        transaction:transactionData.transaction,
        block:transactionData.block
    });
});

app.get('/address/:address',function(req,res){

    const address = req.params.address;
    const addressData= mycoin.getAddress(address);

    res.json({
        addressData:addressData
    });

});

app.listen(port,function(){
    console.log(`Server running on port ${port}`);
});