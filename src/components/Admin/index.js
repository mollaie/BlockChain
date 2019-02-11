import React from 'react';
import { withFirebase } from '../Firebase';
import {Blockchain , Block} from '../../blockChain/mainBlock';


const INITIAL_STATE = {
  date:'',
  amount :0 ,
  userId : 0 , 
}


class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    INITIAL_STATE.userId = this.props.firebase.currentUser();
    var today = new Date(),
    date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    INITIAL_STATE.date = date;
    this.state = {
      ...INITIAL_STATE
    };
  }

  componentDidMount() {
    this.props.firebase.auth.onAuthStateChanged(
      authUser => {
        INITIAL_STATE.userId = authUser.uid;
        this.setState( INITIAL_STATE);
        this.updateWallet();
      },
    );

  }


  onChange = event =>{

    this.setState({ [event.target.name]: event.target.value });

  }

  updateWallet = async ()=>{
    if (this.state.userId != null){
      
      let model = this.state;
      let userWallet = this.props.firebase.db.ref('wallet/'+this.state.userId);
      let users = this.props.firebase.db.ref('users');

      const snappshot = await userWallet.once('value');
      let value = [];
      snappshot.forEach(function(record){          
          let m = record.val();
          m.key = record.key;
          value.push({...m})
      })

      model.Wallet = value;  


      const userSnappshot = await  users.once('value');
      let userList = [] ;
      userSnappshot.forEach(function(record){
        let m  = record.val();
        m.key = record.key;
        userList.push({...m});
      })

      model.Users = userList;

      this.setState({...model})

    }

  }




  onSubmit = event =>{
    this.setState({ [event.target.name]: event.target.value });    
    let jsChain = new Blockchain();
    jsChain.addBlock(new Block(this.state.date, {amount: this.state.amount}));
    
    let value = jsChain;

     var userWallet = this.props.firebase.db.ref('wallet/'+this.state.userId);
     userWallet.push({
       userId : this.state.userId,
       date : this.state.date,
       amount: this.state.amount,
       value : value
     }) 

     this.updateWallet();
  }

  transfer=(item)=>{
    let model= this.state;

    model.Transfer = item;
    this.setState({...model});
    
    
  }

  onTransferChange = event=> {
    let model = this.state;
    let reciever = this.state.Users.find(elm => elm.email === event.target.value);

    model.Transfer.reciver = reciever.key;

    this.setState({...model})

    console.log(this.state)
  }

  doTransfer =()=>{
    let userWallet = this.props.firebase.db.ref('wallet/'+this.state.Transfer.reciver);
    let wallet = {
      amount  : this.state.Transfer.amount,
      date  :this.state.date,
      key:this.state.Transfer.key,
      userId : this.state.Transfer.reciver,
      value: this.state.Transfer.value
    }

    userWallet.push({...wallet}) 

    this.props.firebase.db.ref('wallet/'+this.state.Transfer.userId + '/'+this.state.Transfer.key).remove();
    console.log('remove')
    this.updateWallet();
  }

  generateTransfer=()=>{
    let result = [];
    let userList = this.state.Users;
    if(this.state.Transfer!== undefined){
      result.push(
        <div className="card" key={this.state.Transfer.userId}>
        <h3>transfer Money</h3>
              <p>Amount : {this.state.Transfer.amount}</p>
              <p>Date : {this.state.Transfer.date}</p>
              <p>Hash : <span style={{color:"red"}}>{this.state.Transfer.value.chain[1].hash}</span></p>
              <hr></hr>
              <p>To User: </p>
              <select onChange={this.onTransferChange}>
                {
                    userList.map((item,index)=>{
                      return (<option key={index} value={item.email}>{item.username}</option>)
                    })
                }
              </select>
              <br></br>
              <button type="button" onClick={this.doTransfer}> Transfer</button>
        </div>
      )
    }
    
    return result;
  }
  
  generateWallet =()=>{
    let result = [];
    if(this.state.Wallet !== undefined){
    
    this.state.Wallet.map((item,index)=>{
      result.push(
        <div className="col-md-4" key={index}>
          <div className="card">
                <p>Date : {item.date}</p>
                <p>Amount : {item.amount}</p>
                <button type="button" onClick={()=>this.transfer(item)}>Transfer</button>
          </div>
        </div>
      )
    })   
  }
    return result;
  }


  render() {

    return (

      
      <div className="row">
          <div className="col-md-12">
              <div className="row">
                  <div className="col-md-6">
                      <h3>Wallet Value</h3>       
                        <div className="row">
                            {this.generateWallet()}
                        </div>
                        
                  </div>

                  <div className="col-md-6">
                    <div className="row">
                    <div className="col-md-12">
                        <h3>Generate New Value</h3>
                          <div className="row">
                            <div className="col-md-6">
                                <label>Today is : {this.state.date}</label>
                            </div>
                            <div className="col-md-6">
                              <input type="number" name="amount" onChange={this.onChange} placeholder="Enter amount"/>
                            </div>
                          </div>
                          <br/>
                          <div className="row">
                            <div className="col-md-12">
                                <button type="button" onClick={this.onSubmit}>Submit</button>
                            </div>
                          </div>
                    </div>                    
                  </div>
                    <div className="row">
                      <div className="col-md-12">
                          
                          <div className="row">
                            <div className="col-md-12">
                           
                                    {this.generateTransfer()}
                        
                            </div>
                          </div>

                      </div>
                    </div> 
                  </div>
              </div>
          </div>
      </div>
    );
  }
}


export default withFirebase(AdminPage);