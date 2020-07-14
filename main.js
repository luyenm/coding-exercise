const http = require("http");
const express = require('express');
const app = express();
const port = 8080;
const path = require('path')
const redis = require("redis");
const redisClient = redis.createClient();

const fixerApiKey = process.env.FIXER_API_KEY || '605987b55ead3ad209f40fe75ee9cc2c';

/**
 * Notifies app has successfully connected to redis
 */
redisClient.on('connect', () => {
    console.log("Connected to Redis");
}).on('error', function (error) {
    console.log(error);
});

/**
 * Default endpoint
 */
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname+'/currencyConverter.html'));
})

/**
 * Loading JS file
 */
app.get('/currencyConverter.js', (request, response) => {
    response.sendFile(path.join(__dirname+'/currencyConverter.js'));
})

/**
 * Loads css file
 */
app.get('/currencyConverter.css', (request, response) => {
    response.sendFile(path.join(__dirname  + '/css/currencyConverter.css'));
})

/**
 * Gets supported currencies from fixer, if the currencies don't exist on cache, make a REST API call to fixer.
 * and saves to key "symbols" on redis.
 */
app.get('/supportedCurrencies', (request, response) => {
    let data = ''
    redisClient.get("symbols", (error, reply) => {
        if (reply == null) {
            http.get(`http://data.fixer.io/api/symbols?access_key=${fixerApiKey}`, (apiResponse) => {
                apiResponse.on('data', (chunk) => {
                    data += chunk
                })
                apiResponse.on('end', () => {
                    let json = JSON.parse(data)
                    redisClient.set("symbols", [JSON.stringify(json['symbols'])], (error, reply) => {
                        if (error)
                            console.log(error)
                    })
                    console.log("Symbols pulled from API")
                    response.send(json['symbols'])
                })
            })
        } else {
            console.log("Symbols pulled from redis")
            response.send(JSON.parse(reply))
        }
    })
})

/**
 * Gets rates for currencies on a specific date, if the date has already been queried, save the date to cache.
 */
app.get('/historicalRates', (request, response) => {
    let date = request.query.date
    let symbols = request.query.symbols
    let data = ''
    redisClient.get(date, (error, reply) => {
        if (reply == null) {
            http.get(`http://data.fixer.io/api/${date}?access_key=${fixerApiKey}&symbols=${symbols}`, (apiResponse) => {
                apiResponse.on('data', (chunk) => {
                    data += chunk
                })
                apiResponse.on('end', () => {
                    let json = JSON.parse(data)
                    redisClient.set(date, [JSON.stringify(json['rates'])], (error, reply) => {
                        if (error)
                            console.log(error)
                    })
                    console.log("Rates pulled from API and cached on redis.")
                    response.send(json['rates'])
                })
            })
        } else {
            console.log("Rates pulled from redis")
            response.send(JSON.parse(reply))
        }
    });
})

/**
 * Queries redis for the rate.
 */
app.get('/rate', (request, response) => {
    let date = request.query.date
    redisClient.get(date, (error, reply) => {
        if (reply != null) {
            let json = JSON.parse(reply)
            response.send(json)
        }
    })
})

app.listen(port, () => {
    console.log(`App listening on ${port}`)
})
