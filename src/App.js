import React, { Component } from 'react';
import LoadingImage from './logo.svg';
import './App.css';
import {fetchArticles} from './WikiParse.js';
import {LanguageSelect} from './LanguageSelect.js';

const Loading = function(props) {
    if(props.show) {
        return (
            <div>
                <img src={LoadingImage} alt='loading' className='Logo-image'/>
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

class Articles extends Component {
    constructor() {
        super();
        this.state = {chance: Math.random()};
    }

    render() {
        var props = this.props;
        if(props.ready){
            var correctArticle = <Article text={props.title1} handler={props.correctHandler}></Article>;
            var wrongArticle = <Article text={props.title2} handler={props.wrongHandler}></Article>;
            var article1 = null;
            var article2 = null;
            if(this.state.chance > 0.5){
                article1 = correctArticle;
                article2 = wrongArticle;
            }
            else {
                article1 = wrongArticle;
                article2 = correctArticle;
            }
            return (
                <div>
                    <span className="Target-question">
                        Is <span className="Target-label"><strong>{props.target}</strong></span> wikipedia reference found in: <br/>
                    </span>
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

    componentDidUpdate(prevProps) {
        if(prevProps.target !== this.props.target) {
            this.setState({chance: Math.random()});
        }
    }
}

const SkipButton = function(props) {
    var statusClass = props.skips === 0 ? "Button-disabled" : "";
    return (
        <button onClick={props.handler} className={"Button-skip " + statusClass}>Skip ({props.skips} left) ➡</button>
    )

}

const Message = function(props) {
    if (props.message === null){
        return null;
    }
    else {
        return (
            <p className="Message-label">Correct answer was: {props.message}</p>
        );
    }
}

const Options = function(props) {
    if(props.show === true) {
        return (
            <div className='Options'>
                {props.children}
            </div>
        );
    }
    else {
        return null;
    }
}

const CloseButton = function(props) {
    return(
        <button onClick={props.handler} className="Close-Button">Close</button>
    );
}

class App extends Component {

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <div className="Status-bar">
                        <span className="Highscore-label">
                            Best: {this.state.maxScore}
                        </span>
                        <span className="Title-label">Game of Wiki</span>
                        <span className="Language-select">
                            
                        </span>
                    </div>
                    <div className="Options-button" onClick={this.showOptions}>
                    </div>
                    <span className={"Score-label " + (this.state.animateScore ? 'Score-animate' : '')}>
                            Score: {this.state.score}
                    </span>
                </div>
                <div className="App-main">
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
                    <Message message={this.state.message}></Message> 
                </div>
                <Options show={this.state.showOptions}>
                    <h2>Options</h2>
                    <strong>Language:</strong>&nbsp;
                    <LanguageSelect
                        changeHandler={this.languageChangeHandler}
                        language={this.state.language}>
                    </LanguageSelect>
                    <br/>
                    <h2>Credits</h2>
                    <span>Background image from&nbsp;
                        <a target="_blank" href="https://www.flickr.com/photos/shutterhacks/4474421855">here</a> (CC BY 2.0)
                    </span><br/>
                    <span>Wikipedia logo from&nbsp;
                        <a target="_blank" href="https://en.wikipedia.org/wiki/Wikipedia_logo">here</a> (CC BY-SA 3.0)
                    </span><br/>
                    <CloseButton handler={this.hideOptions}></CloseButton>
                </Options>
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
            animateScore: false,
            message: null,
            showOptions: false
        }

        this.articlePool = [];
        this.poolMax = 3;

        this.componentDidMount = this.componentDidMount.bind(this);
        this.correctHandler = this.correctHandler.bind(this);
        this.wrongHandler = this.wrongHandler.bind(this);
        this.skipHandler = this.skipHandler.bind(this);
        this.loadArticles = this.loadArticles.bind(this);
        this.languageChangeHandler = this.languageChangeHandler.bind(this);
        this.hideOptions = this.hideOptions.bind(this);
        this.showOptions = this.showOptions.bind(this);
    }

    componentDidMount() {
        this.prefetchSingle().then(() =>{
            this.loadArticles()
        });
    }

    loadArticles() {
        this.setState({loading: true});
        if(this.articlePool.length === 0) {
            this.prefetchSingle().then(() => {
                this.loadArticles();
            });
        }
        else {
            var data = this.fromPool();
            this.setState({loading: false, article1: data.article1, article2: data.article2, target: data.target});
            this.forceUpdate();
        }
        this.prefetch();
    }

    prefetchSingle() {
        var that = this;
        return new Promise(function(resolve, reject) {
            fetchArticles(that.state.language).then(function(result) {
                that.articlePool.push({article1: result.article1, article2: result.article2, target: result.target});
                resolve();
            });
        });
    }

    fromPool() {
        return this.articlePool.pop();
    }

    prefetch(){
        for(var i = 0; i < this.poolMax - this.articlePool.length; i++) {
            this.pushToPool();
        }
    }

    pushToPool() {
        var that = this;
        fetchArticles(this.state.language).then(function(result) {
            that.articlePool.push(({article1: result.article1, article2: result.article2, target: result.target}));
        });
    }

    cleanPool() {
        this.articlePool = [];
    }

    correctHandler() {
        var oldScore = this.state.score;
        this.setState({score: oldScore + 1, message: null});
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
        this.setState({score: 0, skips: 0, message: null});
        this.loadArticles();
    }

    skipHandler() {
        if(this.state.skips > 0) {
            this.setState({skips: this.state.skips - 1}, () => {
                this.flashMessage(this.state.article1);
                this.loadArticles();
            });
        }
    }

    flashMessage(messageText) {
        this.setState({message: messageText}, () => {
            // Clear message after 2 seconds
            setTimeout(() => {this.setState({message: null});}, 2000);
        });
    }

    languageChangeHandler(event) {
        this.setState({language: event.target.value}, function() {
            this.cleanPool();
            this.loadArticles();
            localStorage.language = this.state.language;
        });
    }

    showOptions() {
        this.setState({showOptions: true});
    }

    hideOptions() {
        this.setState({showOptions: false});
    }
}

export default App;
