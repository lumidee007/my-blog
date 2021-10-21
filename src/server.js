import express from 'express'
// const express = require('express')

import { MongoClient } from 'mongodb';
import path from 'path'
import cors from 'cors'

const app =express();

app.use(express.json())
app.use(cors())

app.use(express.urlencoded({extended : false}))

app.use(express.static(path.join(__dirname, '/build')));




app.get("/home", (req, res) => res.send("server working"))


// refactoring
const withDB = async (operations, res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        const db = client.db('my-blog');

        await operations(db)
    
        client.close();
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to db', error });
    }
}


// refactoring mongodb get request 
app.get('/api/articles/:name', (req, res) => {
    withDB(async (db)=> {
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({ name: articleName })
        res.status(200).json(articleInfo);
    }, res)    
})

// refactoring mongodb post request for upvote
app.post('/api/articles/:name/upvote', async (req, res) => {
    withDB(async (db) => {
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({ name: articleName })

        await db.collection('articles').updateOne({ name: articleName }, {
            '$set' : {
                upvotes: articleInfo.upvotes + 1
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName })
        res.status(200).json((updatedArticleInfo))
    }, res)
})

// refactoring mongodb post request for comment
app.post('/api/articles/:name/add-comment', (req, res) => {
    const {username, text} = req.body;
    const articleName = req.params.name;
    
    withDB(async (db) => {
        const articleInfo = await db.collection('articles').findOne({ name: articleName })

        await db.collection('articles').updateOne({ name: articleName }, {
            '$set' : {
                comments: articleInfo.comments.concat({username, text})
            }
        });
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName })
        res.status(200).json((updatedArticleInfo))
    }, res)
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

let PORT = 9000;


app.listen(PORT, function () {
    console.log(`app listening on port ${PORT}`)
})


// testing mongodb get request
// app.get('/api/articles/:name', async (req, res) => {
//     try {
//         const articleName = req.params.name;

//         const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
//         const db = client.db('my-blog');
    
//         const articleInfo = await db.collection('articles').findOne({ name: articleName })
//         res.status(200).json(articleInfo);
    
//         client.close();
//     } catch (error) {
//         res.status(500).json({ message: 'Error connecting to db', error });
//     }
    
// })



// mongodb post request for upvote
// app.post('/api/articles/:name/upvote', async (req, res) => {
//     try {
//         const articleName = req.params.name

//     const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });

//         const db = client.db('my-blog');

//         // find article; use findOne
//         const articleInfo = await db.collection('articles').findOne({ name: articleName })

//         //increment ie update number of upvote in the database
//         await db.collection('articles').updateOne({ name: articleName }, {
//             '$set' : {
//                 upvotes: articleInfo.upvotes + 1
//             },
//         });
        
//         const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName })

//         res.status(200).send((updatedArticleInfo))

//         client.close();
//     } catch (error) {
//         res.sendStatus(500).send({ message: 'Error connecting to db', error });
//     }
// })



// app.post('/api/articles/:name/upvote', (req, res) => {
//     const article = req.params.name
//     articlesInfo[article].upvotes += 1
//     res.status(200).send(`${article} now has ${articlesInfo[article].upvotes} upvotes!!!`)
// })

// const articlesInfo = {
//     'learn-react': {
//         upvotes: 0,
//         comments: [],
//     },
//     'learn-node': {
//         upvotes: 0,
//         comments: [],
//     },
//     'my-thoughts-on-resumes': {
//         upvotes: 0,
//         comments: [],
//     },
// }



// app.post('/api/articles/:name/add-comment', (req, res) => {
//     const {username, text} = req.body;
//     const article = req.params.name;
//     articlesInfo[article].comments.push({username, text})
//     res.status(200).send(articlesInfo[article]);
// })