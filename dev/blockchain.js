const sha256 = require('sha256');
const  uuid = require('uuid/v1');

const currentNodeUrl = process.argv[3];

function Blockchain(){
    this.chain=[];
    this.pendingTransaction=[];
    
    this.currentNodeUrl=currentNodeUrl;

    this.networkNodes=[];
    this.createNewBlock(100,'0','0');
}

Blockchain.prototype.createNewBlock=function(nonce,previousBlockHash,hash){

    const newBlock={
        index:this.chain.length+1,
        timestamp:Date.now(),
        transactions:this.pendingTransaction,
        nonce:nonce,
        hash:hash,
        previousBlockHash:previousBlockHash
    };

    this.pendingTransaction=[];
    this.chain.push(newBlock);

    return newBlock;
}

Blockchain.prototype.getLastBlock=function(){
    return this.chain[this.chain.length-1];

}


Blockchain.prototype.createNewTransaction=function(amount,sender,recipient){

    const newTransaction={
        amount:amount,
        sender:sender,
        recipient:recipient,
        transactionId: uuid().split('-').join('')

    };

    return newTransaction; 
}

Blockchain.prototype.addTransactionToPendingTransaction=function (transactionObject){

    this.pendingTransaction.push(transactionObject);

    return this.getLastBlock()['index']+1;
}

Blockchain.prototype.hashBlock=function(previousBlockHash,currentBlockData,nonce){

    const dataString=previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    
    const hash = sha256(dataString);
    return hash;
}


Blockchain.prototype.proofOfWork=function(previousBlockHash,currentBlockData){

    let nonce=0;
    let hash=this.hashBlock(previousBlockHash,currentBlockData,nonce);

    while(hash.substr(0,4) !== '0000'){
        nonce++;
       hash= this.hashBlock(previousBlockHash,currentBlockData,nonce);
    //console.log(hash);
    } 

    return nonce;
}


Blockchain.prototype.chainIsValid = function(blockchain){
    
    let validChain = true;

    for(var i=1;i<blockchain.length;i++){
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i-1];
    const blockHash = this.hashBlock(previousBlock['hash'],{transactions:currentBlock['transactions'],index:currentBlock['index']},currentBlock['nonce']);
    if(blockHash.substring(0,4,) !== '0000')  {
        validChain = false;
    }  

    if(currentBlock['previousBlockHash']  !== previousBlock['hash']){
        validChain = false;
    }

}

const genesisBlock = blockchain[0];
const correctNonce = genesisBlock['nonce'] ===100;
const correctPreviousBlockhash = genesisBlock['previousBlockHash'] === '0';
const correctHash = genesisBlock['hash'] === '0';
const correctTransaction =genesisBlock['transactions'].length === 0;


if(!correctNonce || !correctPreviousBlockhash|| !correctTransaction || !correctHash ){

 validChain =false;
}

 return validChain;
}


Blockchain.prototype.getBlock=function(blockHash){

    let correctBlock = null;
    this.chain.forEach(block => {
        if(block.hash === blockHash){
             correctBlock = block;
             console.log(blockHash);
             console.log(block.hash);
        }
    });
    return correctBlock;
};
 

Blockchain.prototype.getTransaction = function(transactionId){

    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(block => {
        block.transactions.forEach(transaction=>{
            if(transaction.transactionId === transactionId){
                correctTransaction = transaction;
                correctBlock = block;
           }
        });
        
    });

    return {
        transaction:correctTransaction,
        block:correctBlock
    
    };
};



Blockchain.prototype.getAddress = function(address){

    const addressTransactions = [];

    this.chain.forEach(block => {
        block.transactions.forEach(transaction=>{
            if(transaction.sender === address || transaction.recipient === address){

             addressTransactions.push(transaction);
            }
        });  
    });
    
    let balance = 0;

    addressTransactions.forEach(transaction =>{
       if(transaction.recipient === address){
           balance+=transaction.amount;
       }
       else if(transaction.sender === address){
           balance-=transaction.amount;
       }
    });

    return {
        addressTransaction:addressTransactions,
        balance:balance
    
    };
};


module.exports = Blockchain;  