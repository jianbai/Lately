(function () {

	console.log("BLAH");

	var api = new SpotifyWebApi();
	var complete = true;

	function ContentModel() {
		this.artistName = ko.observable("blank");
	}

	ko.applyBindings(new ContentModel());
	$('#search-input').val("");

	window.addEventListener('load', function () {
		var form = document.getElementById('form');
		form.addEventListener('submit', function (error) {
			console.log("HEY");
			complete = false;
			error.preventDefault();
			var search = document.getElementById('search-input');
			api.searchArtists(
				search.value.trim(),
				function (data) {
					if (data.artists && data.artists.items.length) {
						showLatestAlbum(data.artists.items[0]);
					}
				});
		}, false);
	}, false);

	function createAutoCompleteDiv(artist) {
    if (!artist) {
      return;
    }
    var html = '<div class="autocomplete-item">' +
      '<div class="artist-icon-container">' +
      '<img src="' + getArtistImage(artist.images) + '" class="artist-icon" />' +
      '<div class="artist-name-container">' + artist.name + '</div>' +
      '</div>' +
      '</div>';
    return html;
  }

  function createProgressSpinner() {
  	return '<div data-icon="ei-spinner" data-size="xxl" class="spinner"></div>';
  }

  function getArtistImage(images) {
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
  	api.getArtistAlbums(artist.id, {'limit': 50, 'album_type': 'album'}, function (error, data) {
			data.items.forEach(function (album) {
				albumIds.push(album.id);
			});
			console.log(albumIds);
			api.getAlbums(albumIds, {}, function (error, data) {
				console.log(data);
				console.log(getMostRecentAlbum(data.albums));
			});
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
  							if (complete) {
  								response(result);
  							} else {
  								response([]);
  							}
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
  				showLatestAlbum(ui.item);
  				return false;
  			}
  		})
  		.autocomplete('instance')._renderItem = function(ul, item) {
  			if (!item) {
  				console.log("NO ITEM");
  				return;
  			}
  			console.log("ITEM");
  			return $('<li></li>')
  				.data('item.autocomplete', item)
  				.append(createAutoCompleteDiv(item))
  				.appendTo(ul);
  		};
  })

})();



