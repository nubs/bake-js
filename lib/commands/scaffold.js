var debug = require('debug')('bake-scaffold'),
    path = require('path'),
    fs = require('fs'),
    request = require('request'),
    out = require('out'),
    reStatusOK = /^2/,
    reTrailingJS = /\.js$/;

exports = module.exports = function(user, project) {
    var targetUrl = 'https://api.github.com/repos/' + user + '/' + project,
        targetRecipe = path.join(path.resolve(), 'recipes', project),
        output;
        
    debug('recipe file path: ' + targetRecipe);
    path.exists(targetRecipe, function(exists) {
        if (exists) {
            out('!{red}Project "{0}" already exists, remove it if you want to scaffold it again', project);
            return;
        }
        
        debug('searching for recipe details: ' + targetUrl);
        request.get(targetUrl, function(err, res, body) {
            if (reStatusOK.test(res.statusCode)) {
                body = JSON.parse(body);
                
                // generate the output for the recipe
                output = 
                    '# dsc: ' + body.description + '\n' +
                    '# author: ' + user + '\n' + 
                    '# url: ' + body.homepage + '\n' +
                    '# src: ' + body.html_url + '\n' +
                    '# bug: ' + body.html_url + '/issues\n' +
                    '\n[core]\n' + 
                    'js <= github://' + user + '/' + project + '/' + project.replace(reTrailingJS, '') + '.js';
                    
                fs.writeFile(targetRecipe, output, 'utf8', function(err) {
                    if (! err) {
                        out('!{green}Successfully generated recipe: ' + targetRecipe);
                    }
                    else {
                        out('!{red}Unable to generate recipe: ' + targetRecipe);
                    }
                });
            }
            else {
                out('!{red}Unable to find project "{0}" for github user: "{1}"', project, user);
            }
        });
    });
};

exports.desc = 'Scaffold a new recipe';