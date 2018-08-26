const express=require('express');
const bodyParser=require('body-parser');
const request=require('request');
const requestPromise=require('request-promise');
const path=require('path');
const cors=require('cors');
const yelp = require('yelp-fusion');

const app=express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

const YOUR_API_KEY="AIzaSyCWD8XaL8p63QFJXtVLzsKJDqAyLdDqSxY";
const YELP_API_KEY="SWLMNfdlt3-dqJ-X8dbQ0ATKc4lhMTakocbFuElv8-eeqIq3TbAbVAdIzHFuhbOlAk4jHzr8273Xn26WGZ0cNr8-IC0yRO1rHzkqNahAHws4LUa3An78Pp-BCD_EWnYx";




app.get("/",function(req,res){
	  // res.sendfile("public/main.html");
	 res.redirect("newMain.html");
});

app.get("/api",async function(req,res){
	console.log("Inside /api");
	// console.log(req.body);
	console.log(req.query);

	var keyword=req.query.keyword;
	var category=req.query.category;
	var distance=req.query.distance;

	if(distance==""){
		distance = 16090;
	}else{

		distance = Number.parseFloat(distance);
		distance *= 1609;
	}

	var newLocation=req.query.newLocation;
	var currentLat;
	var currentLon;

	if(newLocation!=""){

		var request_url='https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(newLocation) + '&key=' + YOUR_API_KEY;
		try{
			let response= await requestPromise(request_url);
			let data=JSON.parse(response);

			currentLat=data.results[0].geometry.location.lat;
			currentLon=data.results[0].geometry.location.lng;
		}catch(err){
			console.log("ERROR:"  + err);
		}

	} else {

		currentLat=req.query.currentLatitude;
		currentLon=req.query.currentLongitude;
	}

	var request_url= "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + encodeURIComponent(currentLat) + "," + encodeURIComponent(currentLon) + "&radius=" + encodeURIComponent(distance) + "&type=" + encodeURIComponent(category) + "&keyword=" + encodeURIComponent(keyword) + "&key=" + YOUR_API_KEY;

	// console.log(request_url);

	request(request_url,function(error,response,body){

		if(error){
			console.log("Something went wrong");
			console.log(error);
		}else{
			if(response.statusCode == 200){
				var data = JSON.parse(body);
				data.cLat = currentLat;
				data.cLon = currentLon;
				res.json(data);
			}
		}
	})

});


app.get("/nextPageResults",function(req,res){
	
	console.log("Inside next page results");
	var pageToken = req.query.pageToken;


	var request_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=" + encodeURIComponent(pageToken) + "&key=" + YOUR_API_KEY;

	// console.log(request_url);

	request(request_url, function(error,response,body){
		if(error){
			console.log("Something went wrong with next page token");
			console.log(error);
		}else{
			if(response.statusCode == 200){
				var data = JSON.parse(body);
				res.json(data);
			}
		}
	})

});



'use strict';

const client = yelp.client(YELP_API_KEY);


app.get('/yelp',function(req,res){

	console.log("Inside yelp route");
	console.log(req.query);

	var params=req.query;

	if(params.address1 == " "){
		delete params.address1;
	}

	if(params.phone == ""){
		delete params.phone;
	}

	console.log(params);

	 client.businessMatch('best', params).then(response => {
	 	// var id=response.jsonBody.businesses[0].id;
	  	if(response.jsonBody.businesses.length == 0){
	  		console.log("No id found");
	  		res.json('{}');
	  	}else{
	  		var id=response.jsonBody.businesses[0].id;
	  		console.log("ID found: " + id);
	  		res.redirect("/getYelpReviews?id=" + encodeURIComponent(id));
	  	}
	  	console.log(response);
	 }).catch(e => {
  		console.log(e);
	 });

});

app.get('/getYelpReviews',function(req,res){


	console.log("Re routed!");
	console.log(req.query.id);

	var id=req.query.id;

	client.reviews(id).then(response => {
  		// console.log(response.jsonBody);
  		res.json(response.jsonBody);
	}).catch(e => {
  		console.log(e);
	});
});





app.listen(process.env.PORT || 8888, function(){
	console.log("Node server started....");
});