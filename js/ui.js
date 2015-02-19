(function () {

	console.log("BLAH");

	var api = new SpotifyWebApi();
	// var complete = true;

	function ContentModel() {
		this.artistName = ko.observable("that random artist I was just thinking of");
	}

	window.addEventListener('load', function () {
		var form = document.getElementById('form');
		form.addEventListener('submit', function (error) {
			console.log("HEY");
			// complete = false;
			error.preventDefault();
			// var search = document.getElementById('search-input');
			// api.searchArtists(
			// 	search.value.trim(),
			// 	function (data) {
			// 		if (!data) {
			// 			return;
			// 		}
			// 		if (data.artists && data.artists.items.length) {
			// 			showLatestAlbum(data.artists.items[0]);
			// 		}
			// 	});
		}, false);
	}, false);

	function createAutoCompleteDiv(artist) {
    if (!artist) {
      return;
    }
    var html = '<div class="autocomplete-item">' +
      '<div class="artist-icon-container">' +
      '<img src="' + getImage(artist.images) + '" class="artist-icon" />' +
      '<div class="artist-name-container">' + artist.name + '</div>' +
      '</div>' +
      '</div>';
    return html;
  }

  function createAlbumDiv(album) {
  	console.log(album);
  	if (!album) {
      return;
    }
    var html = 
    	'<div class="album">' +
      	'<div class="album-info">' +
      		'<img src="' + getImage(album.images) + '" class="album-image" />' +
      		'<div class="album-text">' +
      			'<div class="album-name">' + album.name + '</div>' +
      			'<div class="album-details">' + getDateString(album) + '</div>' +
      		'</div>' +
      	'</div>' +
      	'<div class="button"><a href="' + album.external_urls.spotify + '">Listen to ' + contentModel.artistName() + ' on Spotify</a></div>' +
      '</div>';
    return html;
  }

  function getImage(images) {
  	var minDimen = 54;
  	if (images.length == 0) {
  		return 'images/Icon.png';
  	}
  	images.forEach(function (image) {
  		if (image && image.width > minDimen && image.height > minDimen) {
  			return image.url;
  		}
  	});
  	return images[images.length - 1].url;
  }

  function showLatestAlbum(artist) {
  	console.log(artist.name);
  	var albumIds = [];
  	var albums = [];
  	api.getArtistAlbums(artist.id, {'limit': 20, 'album_type': 'album'}, function (error, data) {
			if (error == null) {
				data.items.forEach(function (album) {
					albumIds.push(album.id);
				});
				console.log(albumIds);
				api.getAlbums(albumIds, {}, function (error, data) {
					if (error == null) {
						var mostRecentAlbum = getMostRecentAlbum(data.albums);
						$('#album-container').empty();
						$('#album-container').append(createAlbumDiv(mostRecentAlbum));
					}
				});
			}
		});
  }

  function getMostRecentAlbum(albums) {
  	var best = albums[0];

  	for (var i=1; i<albums.length; i++) {
  		var current = albums[i];

  		var currentYear = getAlbumYear(current);
  		var bestYear = getAlbumYear(best);
			if (currentYear > bestYear) {
				best = current;
				continue;
			} else if (currentYear == bestYear) {
				var currentMonth = getAlbumMonth(current);
				var bestMonth = getAlbumMonth(best);
				if (currentMonth > bestMonth) {
					best = current;
					continue;
				} else if (currentMonth == bestMonth) {
					if (getAlbumDay(current) > getAlbumDay(best)) {
						best = current;
						continue;
					}
				}
			}
  	}

  	return best;
  }

  function getAlbumYear(album) {
  	return parseInt(album.release_date) || 0;
  }

  function getAlbumMonth(album) {
  	return parseInt(album.release_date.substr(5,2)) || 0;	
  }

  function getAlbumDay(album) {
  	return parseInt(album.release_date.substr(8,2)) || 0;
  }

  function getDateString(album) {
  	switch(album.release_date_precision) {
  		case "year":
  			return album.release_date;
  		case "month":
  			return monthToString(parseInt(album.release_date.substr(5,2))) + " " + parseInt(album.release_date);
  		case "day":
  			return monthToString(parseInt(album.release_date.substr(5,2))) + " " + album.release_date.substr(8,2) + ", " + parseInt(album.release_date);
  		default:
  			return "";
  	}
  }

  function monthToString(month) {
  	switch(month) {
  		case 1:
  			return "January";
  		case 2:
  			return "February";
  		case 3:
  			return "March";
  		case 4:
  			return "April";
  		case 5:
  			return "May";
  		case 6:
  			return "June";
  		case 7:
  			return "July";
  		case 8:
  			return "August";
  		case 9:
  			return "September";
  		case 10:
  			return "October";
  		case 11:
  			return "November";
  		case 12:
  			return "December";
  		default:
  			return "";
  	}
  }

  $(function () {
  	$('#search-input')
  		.autocomplete({
  			minLength: 0,
  			source: function (request, response) {
  				api.searchArtists(request.term + '*', {'limit': 50, market: 'US'}).then(
  					function (data) {
  						if (data.artists && data.artists.items.length) {
  							var result = [];
  							data.artists.items.forEach(function (artist) {
  								result.push(artist);
  							});
  							// if (true) {
								response(result);
  							// } else {
  							// 	response([]);
  							// }
  						}
  					}, function (error) {
  						return;
  					});
  			},
  			focus: function (event, ui) {
  				return false;
  			},
  			select: function (event, ui) {
  				$('#search-input').val(ui.item.name);
  				contentModel.artistName(ui.item.name);
  				showLatestAlbum(ui.item);
  				return false;
  			}
  		})
  		.autocomplete('instance')._renderItem = function(ul, item) {
  			if (!item) {
  				console.log("NO ITEM");
  				return;
  			}
  			return $('<li></li>')
  				.data('item.autocomplete', item)
  				.append(createAutoCompleteDiv(item))
  				.appendTo(ul);
  		};
  })
	
	var contentModel = new ContentModel();
	ko.applyBindings(contentModel);
	$('#search-input').val("");

})();