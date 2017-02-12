import React, { Component } from 'react';
import LoadingImage from './loader.gif'
import './App.css';
import {fetchArticles} from './WikiParse.js';
import {LanguageSelect} from './LanguageSelect.js';

const Loading = function(props) {
    if(props.show) {
        return (
            <div>
                <h3>Loading...</h3>
                <img src={LoadingImage} alt='loading'/>
            </div>
        );
    }
    else {
        return null;
    }
}

const Article = function(props) {
    return (
        <button className='Article-button' onClick={props.handler}>{props.text}</button>
    );
}

const Articles = function(props) {
    if(props.ready){
        var correctArticle = <Article text={props.title1} handler={props.correctHandler}></Article>;
        var wrongArticle = <Article text={props.title2} handler={props.wrongHandler}></Article>;
        var article1 = null;
        var article2 = null;
        if(Math.random() > 0.5){
            article1 = correctArticle;
            article2 = wrongArticle;
        }
        else {
            article1 = wrongArticle;
            article2 = correctArticle;
        }
        return (
            <div>
                <p>Is <strong>{props.target}</strong> wikipedia reference found in: </p>
                {article1}
                <br/><strong>or</strong><br/>
                {article2}
            </div>
        );
    }
    else{
        return null;
    }
}

const SkipButton = function(props) {
    var statusClass = props.skips === 0 ? "Button-disabled" : "";
    return (
        <button onClick={props.handler} className={"Button-skip " + statusClass}>Skip ({props.skips} left) ➡</button>
    )

}

class App extends Component {

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>Welcome to the Wikipedia Guess Game</h2>
                    <h3 className={"Score-label " + (this.state.animateScore ? 'Score-animate' : '')}>
                        Score: {this.state.score}
                    </h3>
                    <h4>Your highscore: {this.state.maxScore}</h4>
                    Language: <LanguageSelect
                        changeHandler={this.languageChangeHandler}
                        language={this.state.language}>
                    </LanguageSelect>
                </div>
                <Loading show={this.state.loading}></Loading>
                <Articles
                    ready={!this.state.loading}
                    title1={this.state.article1}
                    title2={this.state.article2}
                    correctHandler={this.correctHandler}
                    wrongHandler={this.wrongHandler}
                    target={this.state.target}>
                </Articles>
                <hr/>
                <SkipButton
                    handler={this.skipHandler}
                    skips={this.state.skips}>
                </SkipButton>
                <div className="App-footer">
                    Created by gsiou • Original idea by amostheo • <a href="https://github.com/gsiou/wikipedia-guess-game">GitHub</a>
                </div>
            </div>
        );
    }

    constructor() {
        super();
        var storedMaxScore;
        if(localStorage.maxScore) {
            storedMaxScore = localStorage.maxScore;
        }
        else {
            localStorage.maxScore = 0;
            storedMaxScore = 0;
        }
        var storedLanguage;
        if(localStorage.language) {
            storedLanguage = localStorage.language;
        }
        else {
            localStorage.language = 'en';
        }
        this.state = {
            loading: true,
            article1: null,
            article2: null,
            target: null,
            score: 0,
            maxScore: storedMaxScore,
            skips: 0,
            language: storedLanguage,
            animateScore: false
        }

        this.componentDidMount = this.componentDidMount.bind(this);
        this.correctHandler = this.correctHandler.bind(this);
        this.wrongHandler = this.wrongHandler.bind(this);
        this.skipHandler = this.skipHandler.bind(this);
        this.loadArticles = this.loadArticles.bind(this);
        this.languageChangeHandler = this.languageChangeHandler.bind(this);
    }

    componentDidMount() {
        this.loadArticles();
    }

    loadArticles() {
        this.setState({loading: true});
        var that = this;
        fetchArticles(this.state.language).then(function(result) {
            that.setState({loading: false, article1: result.article1, article2: result.article2, target: result.target});
        });
    }

    correctHandler() {
        var oldScore = this.state.score;
        this.setState({score: oldScore + 1});
        if(oldScore + 1 > this.state.maxScore) {
            this.setState({maxScore: oldScore + 1});
            localStorage.maxScore = oldScore + 1;
        }
        if((oldScore + 1) % 3 === 0) {
            this.setState({skips: this.state.skips + 1});
        }
        this.loadArticles();
        this.setState({animateScore: true}, function(){
            setTimeout(( ) => {this.setState({animateScore: false})}, 500);
        });
    }

    wrongHandler() {
        if(this.state.score > this.state.maxScore) {
            this.setState({maxScore: this.state.score});
            localStorage.maxScore = this.state.score;
        }
        this.setState({score: 0});
        this.setState({skips: 0});
        this.loadArticles();
    }

    skipHandler() {
        if(this.state.skips > 0) {
            this.setState({skips: this.state.skips - 1});
            this.loadArticles();
        }
    }

    languageChangeHandler(event) {
        this.setState({language: event.target.value}, function() {
            this.loadArticles();
            localStorage.language = this.state.language;
        });
    }
}

export default App;
