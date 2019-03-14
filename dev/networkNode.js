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
      body:{allNetworkNodes:[...mycoin.networkNodes,mycoin.currentNodeUrl]},
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
    });

    res.json({
        note:'Bul registration successfully'
    })
});


app.listen(port,function(){
    console.log(`Server running on port ${port}`);
});