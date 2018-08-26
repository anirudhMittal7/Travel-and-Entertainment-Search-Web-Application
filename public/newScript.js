var angularHomework = angular.module('angularHomework', ['ngAnimate']);

var currentLatitude;
var currentLongitude;

var destinationLat;
var destinationLon;

var placesArray=[];

var index=0;

var isGoogleReviews=true;


var map;
var marker;

var cLat,cLon;

var isStreetViewOpen = false;

var cameFromPlacesTable;
var cameFromFavoritesTable;

function SimpleController($http,$scope){

	$scope.openHour = -1;

	$scope.showPlaceTable=false;
	$scope.showFavoriteTable= false;
	$scope.showPrevious=false;
	$scope.showNext=false;
	$scope.showDetailTable=false;
	$.showProgressBar=false;
	$scope.showStreetView=false;

	$scope.placeHours = [];

	$scope.showDetailsButton = false;

	$scope.nearbyPlaces = true;

	//for reviews
	$scope.showGoogleReviews = true;
	$scope.showYelpReviews = false;
	$scope.isGoogleReviews = true;
	$scope.googleReviews = null;

	$scope.showYelpReviewsAlert = false;
	$scope.showGoogleReviewsAlert = false;

	//alert ngshows

	$scope.showPhotosAlert = false;
	$scope.showTableAlert=false;
	$scope.showFavoriteTableAlert = false;

	$scope.failedAlert = false;

	//favorites persistence

	if(localStorage.getItem("myFavorites") !== null){
		$scope.displayFavorites = JSON.parse(localStorage["myFavorites"]);
			//show alert here for no records too!
	}

	// experts

	$scope.selectedRow = null;

	$scope.isValidForm = true;



	$scope.isFavorite= {};

	$scope.selectTab = false;

	if(localStorage.getItem("myFavorites") !== null) { 
		var myFavArray = JSON.parse(localStorage["myFavorites"]);
		for(let i=0; i<myFavArray.length; i++){
			$scope.isFavorite[myFavArray[i].place_id] = true;
		}
	}

			
	$scope.clearEverything = function() { 

		document.getElementById("inputForm").reset();
		$scope.showPlaceTable = false;
		$scope.showFavoriteTable = false;
		$scope.showTableAlert = false;
		$scope.showFavoriteTableAlert = false;
		$scope.showDetailsButton = false;
		$scope.showDetailTable = false;

		$scope.nearbyPlaces = null;

		$scope.isValidForm = false;
		console.log($scope.searchForm);
		console.log(typeof $scope.searchForm);

		$scope.searchForm.$setPristine();
		$scope.searchForm.$invalid = true;

		document.getElementById("inputNewLocation").disabled = true;

	}


	$scope.formSubmitted = function() {

		$('#detailsDisabled').prop('disabled',true);
		$scope.starClass= [];

		$scope.showFavoriteTable = false;
		$scope.showFavoriteTableAlert = false;

		$scope.showDetailTable=false;
		$scope.showPlaceTable=false;
		$scope.showYelpReviewsAlert = false;
		$scope.showGoogleReviewsAlert = false;
		$scope.showDetailsButton = false;

		$scope.selectedRow = null;

		$scope.showProgressBar = true;

		$scope.showTableAlert = false;

		let keyword = $scope.keyword || "";
		let category = $scope.category || "";
		let distance = $scope.distance || "";

		$('#favoritesButton').removeClass("btn-primary");
		$('#favoritesButton').addClass("btn-link");
		$('#resultsButton').removeClass("btn-link");
		$('#resultsButton').addClass("btn-primary");

		$scope.failedAlert = false;

		let radio=$scope.gridRadio;
		let newLocation = "";

		console.log(radio);

		if(radio == "option2"){
			newLocation = $scope.newLocation;
			$('#inputSource').val(newLocation);
		}else{
			newLocation ="";
			$('#inputSource').val("My Location");

		}

		let formData={
			'keyword': keyword,
			'category': category,
			'distance': distance,
			'newLocation':newLocation,
			'currentLatitude': currentLatitude,
			'currentLongitude': currentLongitude
		};

		console.log(formData);

		$http({
			method: 'GET',
			url : '/api',
			params: formData
		})
		.success(function(data){

			console.log(data);
			
			cLat = data.cLat;
			cLon = data.cLon;
			placesArray = [];
			index=0;
			placesArray.push(data);
			$scope.showProgressBar = false;
			$scope.nearbyPlaces=placesArray[index];

			//enter error message here for invalid request

			if(data.status == 'INVALID_REQUEST') {

				$scope.showProgressBar = false;
				$scope.failedAlert = true;
			}else {

				if(data.status != "OK"){
					$scope.showTableAlert = true;
					$scope.showDetailsButton = false;
				}else{
					
					$scope.showPlaceTable=true;	
					$scope.showDetailsButton = true;

				}
				
				console.log(data);

				if(data.hasOwnProperty('next_page_token')){
					$scope.showNext=true;
				}else{
					$scope.showNext=false;
				}
			}


		})
		.error(function(err){
			console.log("error: " + err);
		})
		
	}

    $scope.showNextPageResults = function(element) {

		var pageToken=element.currentTarget.getAttribute("data-nextToken");
		$scope.selectedRow =null;
		// alert(typeof pageToken);
		var dataToSend={
			'pageToken': pageToken
		}
		$http({
			method: 'GET',
			url: '/nextPageResults',
			params: dataToSend
		})
		.success(function(data){

			console.log("Data sent successfully");
			console.log(data);
			placesArray.push(data);
			index++;
			$scope.nearbyPlaces = placesArray[index];
			$scope.showPrevious = true;

			if(!data.hasOwnProperty('next_page_token')){
				$scope.showNext = false;
			}

		})
		.error(function(err){
			console.log("ERROR: " + err);
		})
	}

	$scope.showPreviousPageResults = function() {

		$scope.selectedRow =null;
		index--;
		placesArray.pop();
		$scope.nearbyPlaces = placesArray[index];
		$scope.showNext = true;
		if(index == 0){
			$scope.showPrevious = false;
		}

	}


	$scope.goBackToList = function() {
		
		$scope.showDetailsButton = true;
		if(cameFromPlacesTable){
			$scope.showDetailTable = false;
			$scope.showFavoriteTable = false;
			$scope.showPlaceTable = true;

			$('#favoritesButton').removeClass("btn-primary");
			$('#favoritesButton').addClass("btn-link");
			$('#resultsButton').removeClass("btn-link");
			$('#resultsButton').addClass("btn-primary");
		} else if(cameFromFavoritesTable) {
			$scope.showDetailTable = false;
			$scope.showPlaceTable = false;
			let arr = localStorage.getItem("myFavorites");
			if(arr == '[]'){
				$scope.showFavoriteTableAlert = true;
			}else{
				$scope.showFavoriteTable = true;
			}
			$('#favoritesButton').addClass("btn-primary");
			$('#favoritesButton').removeClass("btn-link");
			$('#resultsButton').addClass("btn-link");
			$('#resultsButton').removeClass("btn-primary");
		}
	}

	$scope.goBackToDetails = function() {

		$scope.showPlaceTable=false;
		$scope.showFavoriteTable = false;
		$scope.showDetailsButton = false;
		$scope.showDetailTable=true;

	}

	$scope.getDetails = function(element, index, pops){

		$scope.showProgressBar = true;
		$scope.selectTab = true;

		if(pops == -1) {
			cameFromPlacesTable = true;
			cameFromFavoritesTable = false;
		} else if(pops == -2) {
			cameFromPlacesTable = false;
			cameFromFavoritesTable = true;
		}

		$scope.selectedRow = index;

		console.log("getDetails");
    	$scope.showPlaceTable=false;
    	$scope.showFavoriteTable = false;
    	$scope.showDetailTable=false;
    	$scope.showDetailsButton = false;
    	$('#detailsDisabled').prop('disabled',false);

		var placeId=element.currentTarget.getAttribute("data-placeid");
		var latitude=Number.parseFloat(element.currentTarget.getAttribute("data-lat"));
		var longitude=Number.parseFloat(element.currentTarget.getAttribute("data-lng"));

		destinationLat = latitude;
		destinationLon = longitude;

		map = new google.maps.Map(document.getElementById('map'),{
			center: {lat: latitude, lng: longitude},
			zoom: 15
		});

		marker = new google.maps.Marker({
	        position: {lat: latitude, lng: longitude},
	        map: map
	    });


		var request = { placeId: placeId };

		var service = new google.maps.places.PlacesService(map);
		service.getDetails(request, function callback(place,status){

			$scope.address=false;
			$scope.phone_number=false;
			$scope.rating=false;
			$scope.google_page=false;
			$scope.price_level=false;
			$scope.hours=false;
			$scope.website=false;


			if (status == google.maps.places.PlacesServiceStatus.OK) {
    			console.log(place);		
    			$scope.placeDetails=place;
    			$scope.destinationField = place.name + ", " + place.formatted_address;   //to set the destination field for map

    			if($scope.placeDetails.formatted_address){
    				$scope.address=true;
    			}

    			if($scope.placeDetails.international_phone_number){
    				$scope.phone_number=true;
    			}

    			if($scope.placeDetails.rating){
    				$scope.rating=true;
    			}

    			if($scope.placeDetails.url){
    				$scope.google_page=true;
    			}

    			if($scope.placeDetails.website){
    				$scope.website=true;
    			}

    			if($scope.placeDetails.price_level){
    				$scope.price_level=true;
    				let priceLevel = $scope.placeDetails.price_level;
    				let dollars="";
    				for(let i=0; i<priceLevel; i++){
    					dollars+="$";
    				}
    				$scope.dollars=dollars;
    			}

    			if($scope.placeDetails.opening_hours){
	    			$scope.hours=true;	//need to do the if condition here after figuring out local time 

	    			//figure out current day and local time
	    			var utc_offset=$scope.placeDetails.utc_offset;

	    			var momentDay=Number.parseInt(moment(moment().utcOffset(utc_offset)).format("e"));

					var googleDay;
					if(momentDay == 0){
						googleDay=6;
					}else{
						googleDay = momentDay - 1;
					}

					$scope.openHour = googleDay;

					var hoursArray = $scope.placeDetails.opening_hours.weekday_text;
					var u=[];
					var v=[];

					for(let y=googleDay; y<hoursArray.length; y++) {
							u.push(hoursArray[y]);
					}

					for(let y=0; y<googleDay; y++){
							v.push(hoursArray[y]);
					}

					var k=0;
					for(let i=0; i<u.length;i++){
							hoursArray[k] = u[i];
							k=k+1;
					}


					for(let i=0; i<v.length;i++){
							hoursArray[k] = v[i];
							k=k+1;
					}

					$scope.placeHours = hoursArray;

					if($scope.placeDetails.opening_hours.open_now){
						$scope.currentOpenState = "Open now:";
						$scope.currentOpenHours = $scope.placeDetails.opening_hours.weekday_text[googleDay].split('y:')[1];				

					}else{
						$scope.currentOpenHours="";
						$scope.currentOpenState = "Closed";
					}
    			}

    			$scope.showPhotos();
    			$scope.greviews();
    			$scope.yreviews();

    			$('#directionsPanel').empty();

				$scope.showProgressBar = false;

				$scope.showDetailTable=true;




    			$scope.$apply();

    			// console.log("placeDetails rating:", $scope.placeDetails.rating);
    			$('#rateYo').rateYo({ rating: $scope.placeDetails.rating, readOnly: true});
    			$('#rateYo').rateYo("option", "rating", $scope.placeDetails.rating);
    			$('#rateYo').rateYo("option", "normalFill", "transparent");
    			$("#rateYo").rateYo("option", "readOnly", true);
    			$("#rateYo").rateYo("option","starWidth", "25px");


  			}

		});

	}

	$scope.yreviews = function() { 

		var address1="";
		var adr_comp1="";
		var adr_comp2="";
		var postal_code="";
		var country="";
		var state="";
		var city="";
		var phone="";


		for(let i=0; i < $scope.placeDetails.address_components.length; i++){

			let component=$scope.placeDetails.address_components[i].types[0];
			let shortName=$scope.placeDetails.address_components[i].short_name;

			if(component == "street_number"){  //first component of address
				adr_comp1 = shortName;
			}else if(component == "route"){   //component for address
				adr_comp2 = shortName;
			}else if(component == "locality"){   //city
				city = shortName;
			}else if(component == "administrative_area_level_1"){  //state
				state = shortName;
			}else if(component == "country"){
				country = shortName;
			}else if(component == "postal_code"){
				postal_code = shortName;
			}
		}

		address1=adr_comp1 + " " + adr_comp2;

		if($scope.placeDetails.hasOwnProperty("international_phone_number")) {
			phone = $scope.placeDetails.international_phone_number.replace(/-|\s/g,"") ;
		}

		var yelp_params = {
			"address1": address1,
			"city": city,
			"state": state,
			"country": country,
			"postal_code": postal_code,
			"name": $scope.placeDetails.name,
			"lat": $scope.placeDetails.geometry.location.lat(),
			"lon": $scope.placeDetails.geometry.location.lng(),
			"phone": phone
				// "phone": $scope.placeDetails.international_phone_number.replace(/-|\s/g,"") 
		};

		$http({
				method: 'GET',
				url : '/yelp',
				params: yelp_params
		})
		.success(function(data){
			console.log(data);

			if(data == '{}' || data.reviews.length === 0){
				$scope.yelpReviews = '{}';
			}else{
				
				for(let i=0; i<data.reviews.length ;i++){
					data.reviews[i].defaultOrderNumber = i+1;
				}
				
				$scope.yelpReviews = data.reviews;
				$scope.showProgressBar = false;
			}

			})
		.error(function(err){
			console.log("ERROR: " + err);
		})	
	}


	$scope.showPhotos = function() {

		if(!($scope.placeDetails.photos)) {
			$scope.showPhotosAlert = true;
			$scope.imageUrls = [];
		}else {
			$scope.showPhotosAlert=false;
			let photosURL=$scope.placeDetails.photos;
			let photos=[];
			for(let i=0; i<photosURL.length; i++){
				let icon=photosURL[i].getUrl({'maxWidth': 1000, 'maxHeight':1000});
				photos.push(icon);
			}
			$scope.imageUrls=photos;
		}
	}

	$scope.showMaps = function() {


		let source = $('#inputSource').val();
		let destination = $('#inputDestination').val();
		let modeOfTravel = $('#inputMode option:selected').val();

		$('#directionsPanel').empty();

  		var directionsService = new google.maps.DirectionsService();
  		var directionsDisplay = new google.maps.DirectionsRenderer();

  		map = new google.maps.Map(document.getElementById('map'),{
			center: {lat: destinationLat, lng: destinationLon},
			zoom: 15
		});

		marker = new google.maps.Marker({
	        position: {lat: destinationLat, lng: destinationLon},
	        map: map
	    });

  		directionsDisplay.setMap(map);
  		directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  		var start;
  		var temp=source;
  		temp = temp.replace(/\s/g, '');
  		temp=temp.toLowerCase();

  		if(temp == "mylocation" || temp== "yourlocation"){

  		 // start=new google.maps.LatLng(currentLatitude,currentLongitude);
  		  start=new google.maps.LatLng(currentLatitude,currentLongitude);

  		}else{
  			start=source;
	  		}
		//var end=new google.maps.LatLng(destinationLat,destinationLon);

       	var request={
        	origin: start,
        	destination: $scope.placeDetails.geometry.location,
        	travelMode: modeOfTravel,
        	provideRouteAlternatives: true
        };

        marker.setMap(null);
    	$scope.showStreetView = false;
    	isStreetViewOpen = false;
    	$("#map").show();
    	$('#street_map_image').attr("src","http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png");

        directionsService.route(request,function(response,status){
        	if(status=='OK'){
        		directionsDisplay.setDirections(response);
        	}
        });

	}

	$scope.streetView = function() {

		var coord = { lat: destinationLat, lng: destinationLon};
		// console.log(coord);
		if(!isStreetViewOpen){
		  	$('#map').hide();
		  	$scope.showStreetView=true;
		  	isStreetViewOpen=true;
		  	var panorama = new google.maps.StreetViewPanorama(
          	document.getElementById('street_view'), {
          		position: coord,
          		pov: {
            			heading: 34,
            			pitch: 10
          			}
        		});
    		map.setStreetView(panorama);
    		$('#street_map_image').attr("src","http://cs-server.usc.edu:45678/hw/hw8/images/Map.png");
    	}else{
    		$scope.showStreetView = false;
    		isStreetViewOpen = false;
    		$("#map").show();
    		$('#street_map_image').attr("src","http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png");
    	}

	}



	$scope.showGoogleReview = function(element){
		
		$scope.showYelpReviewsAlert = false;
		$scope.showYelpReviews = false;
		$scope.showGoogleReviews = true;
		var id=element.currentTarget.id;
		$("#typeReview").html(document.getElementById(id).textContent);
		isGoogleReviews = true;
		console.log(isGoogleReviews);

	}

	$scope.showYelpReview = function(element){

		$scope.showGoogleReviewsAlert = false;
		$scope.showGoogleReviews = false;

		var id=element.currentTarget.id;
		$("#typeReview").html(document.getElementById(id).textContent);
		isGoogleReviews = false;

		$scope.showGoogleReviews = false;
		// $scope.showProgressBar = true;
		if($scope.yelpReviews == '{}'){
			$scope.showYelpReviews = false;
			$scope.showYelpReviewsAlert = true;	
		}else {
			$scope.showYelpReviews = true;
			for(let i=0; i<$scope.yelpReviews.length ;i++){
					let data = $scope.yelpReviews[i];
			 		$("#yelp" + i).rateYo({ rating: data.rating});
     				$("#yelp" + i).rateYo("option", "normalFill", "transparent");
     				$("#yelp" + i).rateYo("option", "rating", data.rating);
     				$("#yelp" + i).rateYo("option", "readOnly", true);
    				$("#yelp" + i).rateYo("option","starWidth", "25px");

     				// $("#yelp" + i).rateYo("option", "numStars", Math.ceil(data.rating));

			 }
		}
		
	}

	// sort the reviews

	$scope.sortReviews = function(element) {

		var id = element.currentTarget.id;
		$('#typeOrder').html(document.getElementById(id).textContent);
		id= String(id);   //sanity check

		console.log(isGoogleReviews);

		if(isGoogleReviews){
			switch(id){

				case 'highest_rating':
					$scope.googleReviews.sort(function(a,b){
						let val1 = a.rating;
						let val2 = b.rating;

						if(val1 > val2){
							return -1;
						}else if(val1 < val2){
							return 1;
						}else{
							return 0;
						}

					});
					break;

				case 'lowest_rating':
					$scope.googleReviews.sort(function(a,b){
						let val1 = a.rating;
						let val2 = b.rating;

						if(val1 > val2){
							return 1;
						}else if(val1 < val2){
							return -1;
						}else{
							return 0;
						}

					});
					break;

				case 'most_recent':
					$scope.googleReviews.sort(function(a,b){
						let val1 = a.time;
						let val2 = b.time;

						if(val1 > val2){
							return -1;
						}else if(val1 < val2){
							return 1;
						}else{
							return 0;
						}
					});

					break;

				case 'least_recent':
					$scope.googleReviews.sort(function(a,b){
						let val1 = a.time;
						let val2 = b.time;

						if(val1 > val2){
							return 1;
						}else if(val1 < val2){
							return -1;
						}else{
							return 0;
						}

					});
					break;

				case 'default_order': 
					// this is the default order case
					$scope.googleReviews.sort(function(a,b){
						let val1 = a.defaultOrderNumber;
						let val2 = b.defaultOrderNumber;

						if(val1 > val2){
							return 1;
						}else if(val1 < val2){
							return -1;
						}else{
							return 0;
						}

					});
					break;

			}
		}else {


			switch(id){

				case 'highest_rating':
					$scope.yelpReviews.sort(function(a,b){
						let val1 = a.rating;
						let val2 = b.rating;

						if(val1 > val2){
							return -1;
						}else if(val1 < val2){
							return 1;
						}else{
							return 0;
						}
					});

				break;

				case 'lowest_rating':
					$scope.yelpReviews.sort(function(a,b){
						let val1 = a.rating;
						let val2 = b.rating;

						if(val1 > val2){
							return 1;
						}else if(val1 < val2){
							return -1;
						}else{
							return 0;
						}
					});

				break;

				case 'most_recent':
					$scope.yelpReviews.sort(function(a,b){
						let val1 = a.time_created;
						let val2 = b.time_created;

						if(val1 > val2){
							return -1;
						}else if(val1 < val2){
							return 1;
						}else{
							return 0;
						}
					});

				break;

				case 'least_recent':

					$scope.yelpReviews.sort(function(a,b){
						let val1 = a.time_created;
						let val2 = b.time_created;

						if(val1 > val2){
							return 1;
						}else if(val1 < val2){
							return -1;
						}else{
							return 0;
						}
					});

				break;


				case 'default_order':

					$scope.yelpReviews.sort(function(a,b){
						let val1 = a.defaultOrderNumber;
						let val2 = b.defaultOrderNumber;

						if(val1 > val2){
							return 1;
						}else if(val1 < val2){
							return -1;
						}else{
							return 0;
						}
					});

				break;

			}

		}
	
	}


	$scope.greviews = function() { 
		

		$scope.googleReviews = $scope.placeDetails.reviews;
		if(!$scope.placeDetails.reviews || $scope.placeDetails.reviews.length === 0 ){
			$scope.showGoogleReviewsAlert = true;
		}else {

			for(let i=0; i<$scope.placeDetails.reviews.length; i++){

					let unix_time_stamp = $scope.placeDetails.reviews[i].time;
					let date = new Date(unix_time_stamp*1000);
					let year = date.getFullYear();
					let month = date.getMonth() + 1;
					if(month < 10){
						month = "0" + month;
					}
					let day = date.getDate();
					if(day < 10 ){ day = "0" + day;}
					let hours = date.getHours();
					let min = date.getMinutes();
					let sec = date.getSeconds();
					if(sec < 10) { sec="0" + sec};

					let time_stamp = year + "-" + month + "-" + day + " " + hours + ":" + min + ":" + sec;
					$scope.googleReviews[i].timeStamp=time_stamp;
					$scope.googleReviews[i].defaultOrderNumber = i + 1;


			}

			for(let i=0; i<$scope.placeDetails.reviews.length; i++) {
    			$("#google" + i).rateYo({ rating: $scope.placeDetails.reviews[i].rating});
    			$("#google" + i).rateYo("option", "normalFill", "transparent");
    			$("#google" + i).rateYo("option", "rating", $scope.placeDetails.reviews[i].rating);
    			$("#google" + i).rateYo("option", "readOnly", true);
    			$("#google" + i).rateYo("option","starWidth", "25px");

			}
		}



	}

	$scope.tweetTheTweet = function() { 

		var url = 'https://twitter.com/intent/tweet';
		var text = 'Check out ' + $scope.placeDetails.name + ' located at ' + $scope.placeDetails.formatted_address + '.';
		if($scope.placeDetails.website) {
			text += ' Website: ' + $scope.placeDetails.website;
		}else if($scope.placeDetails.url) {
			text += ' Website: ' + $scope.placeDetails.url;
		}else {
			text += ' Website:' ;
		}


		text=encodeURIComponent(text);
		text += ' %23TravelAndEntertainmentSearch';


		var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    	var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    	var left = (width / 2);
    	var top = (height / 2);

		window.open(url + "?text=" + text,"","width=550,height=420,top=" + top + ",left=" + left + ",toolbar=yes,scrollbar=yes,resizable=yes");

	}

	$scope.addPlaceToFavorites = function(element){

		var place = JSON.parse(element.currentTarget.getAttribute("data-place"));
		
		if(localStorage.getItem("myFavorites") === null) { 
			var favoritesArray = [];
			favoritesArray.push(place);
			localStorage["myFavorites"] = JSON.stringify(favoritesArray);
		} else {

			var favArray = JSON.parse(localStorage["myFavorites"]);
			var isFav = false;

			for(let i=0; i< favArray.length; i++) { 
				if(favArray[i].place_id == place.place_id) {
					isFav = true;
					break;
				}
			}

			if(isFav) {

				//remove from favorite list
				// event.currentTarget.children[0].setAttribute("class", "fa fa-star-o");
				$scope.isFavorite[place.place_id] = false;
				$scope.removeThisPlace(place.place_id);
				console.log("not inserting stuff here.....");


			}else{
				favArray.push(place);
				// event.currentTarget.children[0].setAttribute("class", "fa fa-star");
				$scope.isFavorite[place.place_id] = true;
				localStorage["myFavorites"] = JSON.stringify(favArray);	

				console.log("inserting stuff here.....");
			}

		}

	}

	$scope.removeThisPlace = function(placeId) {

		$scope.isFavorite[placeId] = false;
		var favArray = JSON.parse(localStorage["myFavorites"]);
		var index = -1;
		for(let i=0; i<favArray.length ; i++) {
			if(favArray[i].place_id == placeId) {
				index = i;

			}
		}

		if(index > -1){
			favArray.splice(index,1);
			localStorage["myFavorites"] = JSON.stringify(favArray);
			$scope.displayFavorites =  JSON.parse(localStorage["myFavorites"]);

		}

	}

	$scope.removePlaceFromFavorites = function(element) { 

		var placeId = element.currentTarget.getAttribute("data-placeKey");
		console.log(placeId);
		$scope.isFavorite[placeId] = false;;
		var favArray = JSON.parse(localStorage["myFavorites"]);
		var index = -1;
		for(let i=0; i<favArray.length ; i++) {
			if(favArray[i].place_id == placeId) {
				index = i;
			}
		}
		if(index > -1){
			favArray.splice(index,1);
			localStorage["myFavorites"] = JSON.stringify(favArray);
			$scope.displayFavorites =  JSON.parse(localStorage["myFavorites"]);

			if(favArray.length === 0){
				$scope.showFavoriteTable = false;
				$scope.showDetailsButton = false;
				$scope.showFavoriteTableAlert = true;
			}

		}


	}


	$scope.favoritesButtonClicked = function() { 

		$('#resultsButton').removeClass("btn-primary");
		$('#resultsButton').addClass("btn-link");
		$('#favoritesButton').removeClass("btn-link");
		$('#favoritesButton').addClass("btn-primary");

		$scope.showPlaceTable = false;
		$scope.showTableAlert = false;
		$scope.showDetailTable = false;
		



		//get data from local storage
		if(localStorage.getItem("myFavorites") !== null){
			$scope.displayFavorites = JSON.parse(localStorage["myFavorites"]);
			//show alert here for no records too!
			if($scope.displayFavorites.length === 0){
				$scope.showFavoriteTableAlert = true;	
				$scope.showDetailsButton = false;
			}else{
			//show favorites tables
			$scope.showFavoriteTable= true;
			$scope.showDetailsButton = true;
			}
		}else {
			$scope.showFavoriteTableAlert = true;
			$scope.showDetailsButton = false;

		}
		

	}



	$scope.resultsButtonClicked = function(){

		$('#favoritesButton').removeClass("btn-primary");
		$('#favoritesButton').addClass("btn-link");
		$('#resultsButton').removeClass("btn-link");
		$('#resultsButton').addClass("btn-primary");

		

		//hide favorites table
		$scope.showFavoriteTable = false;
		$scope.showFavoriteTableAlert = false;
		$scope.showDetailTable = false;

		//show placeTable
		if(!$scope.nearbyPlaces || $scope.nearbyPlaces.status != "OK"){
			$scope.showPlaceTable = false;
			$scope.showDetailsButton = false;
			$scope.showTableAlert = true;
		} else{
			$scope.showPlaceTable = true;
			$scope.showDetailsButton = true;
		}	

	}



	$('input[type=\'radio\'][name=\'gridRadios\']').change(function(){
		if(this.value=='option1'){
			$('#inputNewLocation').prop('disabled',true);
		}else if(this.value=='option2'){
			$('#inputNewLocation').prop('disabled',false);
		}	
	});

}

angularHomework.controller('SimpleController',SimpleController);

/* Fetch the current location from ip-api and enable search */
$(document).ready(function(){

	// $('button[type=\'submit\']').prop('disabled',true);
	$.ajax({
		
		type: "GET",
		url: "http://ip-api.com/json",

		success: function(response){
			// $('button[type=\'submit\']').prop('disabled',false);
			currentLongitude=response['lon'];
			currentLatitude=response['lat'];

		},

		error: function(xhr,status){
			console.log("ERROR : " + status);
		}
	});
});


function activatePlaceSearch(){
	var input1=document.getElementById('inputNewLocation');
	var autoComplete=new google.maps.places.Autocomplete(input1,{types: ['geocode']});

	//autoComplete.addListener('place_changed',function(){});

	var input2=document.getElementById("inputSource");
	var autoComplete2=new google.maps.places.Autocomplete(input2,{types: ['geocode']});

}


