"use strict";

const missing = "https://tinyurl.com/missing-tv"

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $eList = $("#episodesList");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(q) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const tvAPI = await axios.get(`http://api.tvmaze.com/search/shows`, {params: {q}});

  return tvAPI.data.map(tvAPI => {
    const show = tvAPI.show;
    return {
      id: show.id,
      name: show.name,
      image: show.image ? show.image.medium : missing,
    };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  const episodes = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  return episodes.data.map(e => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));

}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $eList.empty();

  for (let episode of episodes) {
    const $item = $(
      `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `);

      $eList.append($item)
  }

  $episodesArea.show();
 }

async function getDisplayEps(e) {
  const show = $(e.target).closest(".Show").data(".show-id");
  const episodes = await getEpisodesOfShow(show);
  populateEpisodes(episodes);
}


 $showsList.on("click", ".Show-getEpisodes", getDisplayEps)
