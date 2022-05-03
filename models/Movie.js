const mongoose = require("mongoose"); 
//var Comment = require("./comment"); 

const movieSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required:true
    },
    // comments: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Comment",
    //     },
    // ],
    // createTime: {type: Date, default: Date.now},

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    description: String,

  });

module.exports = mongoose.model("movie", movieSchema); 