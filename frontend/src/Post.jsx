import React from 'react';
import { Container,  Row,Col } from 'reactstrap';

import {Redirect} from 'react-router-dom'
import Wishlist from './Wishlist.jsx';
// import FoodOffered from './FoodOffered.jsx';
import Resource from './models/resource';
// import WishContainer from './WishContainer.jsx';

  const PostStore = Resource('posts');
  const Trade = Resource('trades');

  class Post extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        postId : (props.match.params.postId || null ),
        post:{ user:{wishlist:[]}, food:"" } ,
        errors: null,
        typeOfTrade: "twoway",
        redirect:'',
        collapse: false,
        selected_food_item:"",
        current_user: 1,
        isHidden:true,
        radio_selection:"",
        offered_item:"",
        secondlevel_trade:"",
        trade_list:"",        // list of 2rd level trades
        trade_radio_select:"",
        trade_id: ""          // the associated id of the trade radio button
      }
    }

    componentDidMount() {

      PostStore.find(this.state.postId)
      .then((result) =>{
        this.setState({

          post: result,
          errors: null,
          show: true,
          redirect: ''
        })
        console.log(' user selected: ', this.state.selected);
      })
      .catch((errors) => this.setState({errors: errors}))
    }

    select  =  (event) => {
      this.setState({
        dropdownOpen: !this.state.dropdownOpen,
        value: event.target.innerText
      });
    }

    handleTradeButton = async (event) =>{
      
      event.preventDefault();
      // Check the state variable to determine the type of trade to execute
      if (this.state.typeOfTrade ==="twoway"){
        console.log("2way called")
       this.handleTwoWayTrade(event)
      } else if (this.state.typeOfTrade ==="threeway"){
        this.handleThreeWayTrade(event);

      }
    }

    clear_Radio = (event) =>{
      event.preventDefault();
      this.setState({
          radio_selection:false
        });
    }

    handleChange = async (event) => {
      event.preventDefault();
      console.log("got called !!")
      
      this.setState({
        selected_food_item: event.target.value
      })
      
      let result = await fetch(`http://localhost:8080/posts/${this.state.postId}/secondarylist/1`,
      { method:'GET', mode:'cors'})
      .then( result  =>{
        return result.json();
        // console.log("data stores:" , result.json())
      })
      this.setState({trade_list:result})
    }
    
    handleRadioChange = (event) => {
      console.log("radio button item: ",event.target.value)
      this.setState({
        radio_selection: event.target.value
      });
    }

    handleTradeAction = (event) =>{
      // process the result from what was chosen from
      // second level menu
      event.preventDefault();
      this.setState({trade_radio_select: event.target.value})
    }
   
    handleTradeRadioChange = (event) =>{
      this.setState({
        trade_radio_select: event.target.value,
        typeOfTrade: "threeway",
        trade_id: event.target.getAttribute("id")
      });
      console.log("radio button index:",event.target.getAttribute('id'));
    }

    handleThreeWayTrade = (event) =>{
      event.preventDefault();   
      event.stopPropagation()   // prevents the nested from also triggering parent form 
      console.log("Confirm Trade",this.state.trade_radio_select, " ID: ",this.state.trade_id, typeof this.state.trade_id)
      let temp = Number(this.state.trade_id);
      let trade_data = this.state.trade_list;
      console.log("This is trades list: ",this.state.trade_list,"temP: ",temp);
      let i = 0;
      let the_data={};
      for (var item in trade_data){
        if (i === temp){
           the_data[item]= trade_data[item];
        }
        i++;
      }
      // Attempt to push the 3way trade info to the trade table.
      // Need to confirm with Jordan
      Trade.create(JSON.stringify({the_data, 
        users: [{user_id: this.state.post.user.id}, {user_id:this.state.current_user }]}))
        .then(response => {
          this.setState({trade_id:response.data})
          const Url = this.buildUrl(response.data) // sets up localhst
          console.log("new url for 3way: ",Url)
          this.setState({redirect: Url})
        })
      }

    buildUrl =   (param)  => {
      console.log('building: '+`http://localhost:3000/trades/${param}`);
      return `/trades/${param}`;
    }

    handleTwoWayTrade = (event) => {
      let sel_food="";
      event.preventDefault(); 
  
      if (!this.state.selected_food_item) {
        sel_food = this.state.post.food.name;
      } else {
        sel_food = this.state.selected_food_item
      }
      Trade.create(JSON.stringify({
        will_give_to_poster : sel_food,
        wants_from_poster: this.state.post.food.name, 
        postId:this.state.postId,
        current_user: this.state.current_user,
        users: [{user_id: this.state.post.user.id}, {user_id:this.state.current_user }]
        })
        ) .then ( response => {
          this.setState({trade_id:response.data})
          const Url = this.buildUrl(response.data) // sets up localhst
          this.setState({redirect: Url})
        })
      }

    handleClick = (ev) => {
      ev.preventDefault();
      this.setState({show:true});
    }

    toggle = () => {
      this.setState({ collapse: !this.state.collapse });
    }
    
    toggleHidden =() =>  {
      this.setState({
        isHidden: !this.state.isHidden
      })
    }


  render () {
    let userwishlist = this.state.post.user.wishlist;
    
    if (this.state.redirect !== '') {
      return <Redirect to={this.state.redirect} />
    }

  return (
    <Container id="big-Container">
    <Row className="mainItem">
      <Col xs="7">
        <img className ="imgView" src ={this.state.post.food_picture_url} alt="" />
      </Col>
      
      <Col xs="5">
        <Row>
          <h3>Item: <b>{this.state.post.food.name} </b> </h3> <br/>
          <div className="itemDescription">
          {this.state.post.description}<br/><br/>
          </div>
        </Row>
      </Col>
    </Row>    
    <Row className="mainItem">   
  
      <Col xs="6">
      Map Id :{this.state.post.location_id}<br/> <br/>
      </Col>
    </Row>
    <Row className="mainItem">

    <Col xs="6"><img id = "user-avatar" src = {this.state.post.user.avatar} ></img> 
    <br/>
    <div className="rating">
    <h4 className="leftRating">Name: {this.state.post.user.username}</h4>
    <h4 className="leftRating">Rating :{this.state.post.user.average_rating} </h4>
    </div>
    </Col>

      
 
    <Col xs="6" className="wishList">
    <div className="wishListButton">
        <button  onClick = {this.toggleHidden}>
        Show Wishlist
        </button>
        {!this.state.isHidden && 
          <Wishlist list={userwishlist} form_action = {this.handleChange}
          radio_action = {this.handleRadioChange}
          radio_select ={this.state.radio_selection}
          clear_Radio = {this.clear_Radio}
          
          trade_radio_action = {this.handleTradeRadioChange}
          trade_radio_select = {this.state.trade_radio_select}
          trade_list         = {this.state.trade_list}
          trade_form_action  = {this.handleThreeWayTrade}
          
          /> 
        }
     </div>
     <button onClick={this.handleTradeButton}>Confirm Trade !</button>
    </Col>
  
   </Row>   
   </Container>
    );
  };
}
    
export default Post;