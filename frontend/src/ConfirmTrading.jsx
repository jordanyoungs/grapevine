import React from 'react';
import { Table, Drawer, Button } from 'antd';
import TradeOpt from './TradeOpt.jsx';
import TwoWayTrade from './TwoWayTrade.jsx';
import './styles/App.css';
import Resource from './models/resource'


const TradesDB = Resource('trades');

class ConfirmTrading extends React.Component {
  constructor(props) {
    super(props);
/*    let confirmed = {};
    console.log("------------test--------", props)
    props.users.forEach(user => {
      console.log('constructor foreach user', user)
      confirmed[user] = user.confirmed;
    })*/
    this.state = {
      confirmed: null
    }
  }


/*  disableBtn = () {
    document.getElementById("myBtn").disabled = true;
  }*/

  handleClick = evt => {
    evt.preventDefault();
    console.log("-----props: ", this.props);
    if(evt.target.name === "confirm"){
      this.props.currentUserConfirm(true);
    }
    if(evt.target.name === "decline"){
      this.props.currentUserConfirm(false);
    }

  }

/*  handleDeclineClick = evt => {
    evt.preventDefault();
    TradesDB.update(`${this.props.tradesId}/users/1`, JSON.stringify({confirmed: false}))
    .then((result) => {
      console.log('----------result ', result);
    })
    .catch((errors) => this.setState({errors: errors}))
  }*/

  render() {
    const columns = [
      {
        title: 'Trading Infor. Detail',
        dataIndex: 'trades',
      }, {
        title: 'Trading Users',
        className: 'column-money',
        dataIndex: 'user',
      }, {
        title: 'Confirmation',
        dataIndex: 'confirmed',
        render: text => {
            if (text === true) {
              return "Confirmed";
            } else if (text === false) {
              return "The user denied this trading, please back to main page start a new trade";
            } else {
              return "wait for the user to confirm this trade...";
            }
          }
        }
    ];

    const data = (edges, users) => {
      let result = [];

      edges.forEach((edge, index) => {
        const available_foods = edge.foods.join(' & ');
        result[index] = {
          trades: `${edge.from} has ${available_foods} available which match ${edge.to}'s wishlist`
        };
      })

      users.forEach((user, index) => {
        result[index].confirmed = user.confirmed;
        result[index].user = user.username;
      })

      return result;
    }

    let tradeOpt;
    if (this.props.edges.length === 3) {
      tradeOpt = this.props.edges.map((item,index) => <TradeOpt key={index} classKey={index} item={item} /> );
    } else {
      tradeOpt = this.props.edges.map((item,index) => <TwoWayTrade key={index} twoClassKey={index} twoItem={item} /> );
    }
    console.log("!!!!this is users:", this.props.users)

    return (
      <div>
{/*        <h1>hi</h1>*/}
        <div className="allTrades">
          {tradeOpt}
        </div>

        <Table className="tradingTable" columns={columns} dataSource={data(this.props.edges, this.props.users)} bordered/>

        <div className="tradingConfirm">
          <h4>Please kindly confirm whether you want process this trading: </h4>
          <input  id="confirmBtn" type="submit" value="Confirm!" name="confirm" onClick={this.handleClick} />
          <input id="declineBtn" type="submit" value="Decline!" name="decline" onClick={this.handleClick} />
        </div>
      </div>
    )
  }
}

export default ConfirmTrading


