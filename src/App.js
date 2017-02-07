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
        <p>{props.text}</p>
    );
}

const Articles = function(props) {
    if(props.ready){
        return (
            <div>
                <p>{props.target}</p>
                <Article text={props.title1}></Article>
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
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
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
