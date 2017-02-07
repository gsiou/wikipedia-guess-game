import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {fetchArticles} from './WikiParse.js';

const Loading = function(props) {
    if(props.show) {
        return (
            <img src='https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif' alt='loading'/>
        );
    }
    else {
        return null;
    }
}

const Article = function(props) {
    return (
        <button className='Article-button'>{props.text}</button>
    );
}

const Articles = function(props) {
    if(props.ready){
        return (
            <div>
                <p>Is <strong>{props.target}</strong> found in: </p>
                <Article text={props.title1}></Article>
                <br/><strong>or</strong><br/>
                <Article text={props.title2}></Article>
            </div>
        );
    }
    else{
        return null;
    }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to the Wikipedia Guess Game</h2>
          <h3>Blablablablabla</h3>
        </div>
        <Loading show={this.state.loading}></Loading>
        <Articles
            ready={!this.state.loading}
            title1={this.state.article1}
            title2={this.state.article2}
            target={this.state.target}>
        </Articles>
      </div>
    );
  }

  constructor() {
    super();
    this.state = {
        loading: true,
        article1: null,
        article2: null,
        target: null,
        score: 0
    }
    var that = this;
    fetchArticles().then(function(result) {
        console.log(result);
        that.setState({loading: false, article1: result.article1, article2: result.article2, target: result.target});
    });
  }
}

export default App;
