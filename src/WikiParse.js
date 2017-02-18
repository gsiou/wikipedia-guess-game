export function fetchArticles(language='en') {
    return new Promise(function(resolve, reject) {
        
        getRandom(language, function (fullarticle) {
            var links = extractLinks(fullarticle);
            // Get the topic to be questioned
            do {
                var random_link_index = randomInt(0, links.length);
                var target_link_obj = links[random_link_index];
            } while(target_link_obj.ns !== 0);
            
            // Find related link
            /*
            getRelated(target_link_obj, random_link_index, links, language, function(result) {
                resolve({
                    "article1": getTitle(fullarticle),
                    "article2": getTitle(result),
                    "target": target_link_obj.title
                });
            });
            */
            getUniqueRandom(target_link_obj, getTitle(fullarticle), links, language, function(result) {
                resolve({
                    "article1": getTitle(fullarticle),
                    "article2": getTitle(result),
                    "target": target_link_obj.title
                });
            });
        });
    });
}

function getRandom(language, callback){
    var random_article_promise = fetchFromWiki({
        'action': 'query',
        'grnlimit': 1,
        'generator': 'random',
        'grnnamespace': 0,
        'format': 'json',
        'origin': '*'
    }, language);
    
    random_article_promise.then(function(article) {
        var articleobj = JSON.parse(article);
        var pages = articleobj.query.pages;
        var pageid = pages[(Object.keys(pages)[0])].pageid;

        fetchFromWiki({
            'action': 'query',
            'prop': 'links',
            'pllimit': 'max',
            'format': 'json',
            'pageids': pageid,
            'origin': '*'
        }, language).then(function(article){
            if(extractLinks(article) === undefined){
                getRandom(language, callback);
            }
            else{
                callback(article);
            }
        });
    });
}


function getRelated(target_link_obj, random_link_index, links, language, callback) {
    do {
        var second_article_index = randomInt(0, links.length);
    } while(second_article_index === random_link_index || links[second_article_index].ns !== 0);
    
    // Get articles links
    fetchFromWiki({
        'action': 'query',
        'prop': 'links',
        'pllimit': 'max',
        'format': 'json',
        'titles': links[second_article_index].title,
        'origin': '*'
    }, language).then(function(second_article) {
        var second_links = extractLinks(second_article);
        if(second_links === undefined){
            getRelated(target_link_obj, random_link_index, links, language, callback);
        }
        else{
            var unique = true;
            for(var i = 0; i < second_links.length; i++) {
                if(second_links[i].title === target_link_obj.title){
                    unique = false;
                    break;
                }
            }
            if(unique){
                callback(second_article);
            }
            else{
                getRelated(target_link_obj, random_link_index, links, language, callback);
            }
        }
    });
}

function getUniqueRandom(target_link_obj, random_link_title, links, language, callback) {
    // Get articles links
    var random_article_promise = fetchFromWiki({
        'action': 'query',
        'grnlimit': 1,
        'generator': 'random',
        'grnnamespace': 0,
        'format': 'json',
        'origin': '*'
    }, language);
    
    random_article_promise.then(function(article) {
        var articleobj = JSON.parse(article);
        var pages = articleobj.query.pages;
        var title = pages[(Object.keys(pages)[0])].title;
        if(title === random_link_title) {
            // Same as random, try again.
            getUniqueRandom(target_link_obj, random_link_title, links, language, callback);
        }
        else {
            fetchFromWiki({
                        'action': 'query',
                        'prop': 'links',
                        'pllimit': 'max',
                        'format': 'json',
                        'titles': title,
                        'origin': '*'
            }, language).then(function(article) {
                var article_links = extractLinks(article);
                if(article_links === undefined){
                    getUniqueRandom(target_link_obj, random_link_title, links, language, callback);
                }
                else{
                    var unique = true;
                    for(var i = 0; i < article_links.length; i++) {
                        if(article_links[i].title === target_link_obj.title){
                            unique = false;
                            break;
                        }
                    }
                    if(unique){
                        callback(article);
                    }
                    else{
                        getUniqueRandom(target_link_obj, random_link_title, links, language, callback);
                    }
                }
            });
        }
    });
}


function fetchFromWiki(options, language = "en") {
    return new Promise(function (resolve, reject){
        var xhr = new XMLHttpRequest();
        var url = Object.keys(options).map((k) => {
            return (k) + '=' + (options[k])
        }).join('&');

        xhr.open('GET', 'https://' + language + '.wikipedia.org/w/api.php?' + url, true);
        xhr.setRequestHeader('Api-User-Agent', 'Wikipedia-guess-game/1.0 (dr.george995@gmail.com) ');
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(null);
        
        xhr.onreadystatechange = function() {
            var DONE = 4;
            var OK = 200;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    resolve(xhr.responseText);
                }
                else {
                    reject(xhr.status);
                }
            }
        }
    });
}

function extractLinks(article) {
    var articleobj = JSON.parse(article);
    var pages = articleobj.query.pages;
    var links = pages[Object.keys(pages)[0]].links;
    return links;
}

function getTitle(article) {
    var articleobj = JSON.parse(article);
    var pages = articleobj.query.pages;
    return pages[Object.keys(pages)[0]].title;
}

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
