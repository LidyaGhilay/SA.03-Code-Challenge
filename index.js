

document.addEventListener("DOMContentLoaded", () => {
  const URL = "http://localhost:3000";
  const urlfilms = `${URL}/films`;

  // Fetches data by the id
  async function fetchFilmById(id) {
    const response = await fetch(`${urlfilms}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch film with ID ${id}`);
    }
    const data = await response.json();
    return data;
  }

  
  function updateFilmDetails(film) {
    const poster = document.getElementById("poster");
    const title = document.getElementById("title");
    const runtime = document.getElementById("runtime");
    const filmDescrip = document.getElementById("film-info");
    const showtime = document.getElementById("showtime");
    const ticketNum = document.getElementById("ticket-num");

    poster.src = film.poster;
    title.textContent = film.title;
    runtime.textContent = `${film.runtime} minutes`;
    filmDescrip.textContent = film.description;
    showtime.textContent = film.showtime;
    const availableTickets = film.capacity - film.tickets_sold;
    ticketNum.textContent = availableTickets;

    // Prevent a person from buying a ticket when sold out
    const buyTicketbutton = document.getElementById("buy-ticket");
    buyTicketbutton.disabled = availableTickets === 0;
    if (availableTickets === 0) {
      buyTicketbutton.textContent = "Sold Out";
    } else {
      buyTicketbutton.textContent = "Buy Ticket";
    }
  }

  // Fetch and populate the films list
  async function fetchAndPopulateFilms() {
    const response = await fetch(urlfilms);
    if (!response.ok) {
      throw new Error("Failed to fetch films");
    }
    const movies = await response.json();
    const filmsList = document.getElementById("films");
    filmsList.innerHTML = ""; // Clear existing list

    movies.forEach((film) => {
      const mov = document.createElement("li");
      mov.classList.add("film", "item");
      mov.textContent = film.title;
      mov.addEventListener("click", async () => {
        try {
          const selectedFilm = await fetchFilmById(film.id);
          updateFilmDetails(selectedFilm);
        } catch (error) {
          console.error(error.message);
        }
      });
      filmsList.appendChild(mov);
    });
  }

   
  async function buyTicket(filmId) {
    try {
      const response = await fetch(`${urlfilms}/${filmId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch film with ID ${filmId}`);
      }
      const film = await response.json();
      if (film.tickets_sold === film.capacity) {
        alert("Sorry, this movie is sold out!");
        return;
      }
      const updatedTicketsSold = film.tickets_sold + 1;
      const patchResponse = await fetch(`${urlfilms}/${filmId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tickets_sold: updatedTicketsSold,
        }),
      });
      if (!patchResponse.ok) {
        throw new Error("Failed to update tickets sold");
      }
      
      const updatedFilm = await fetchFilmById(filmId);
      updateFilmDetails(updatedFilm);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function hopefully() {
    try {
      const response = await fetch(`${urlfilms}/1`);
      if (!response.ok) {
        throw new Error("Failed to fetch initial film data");
      }
      const firstFilm = await response.json();
      updateFilmDetails(firstFilm);
      await fetchAndPopulateFilms();
    } catch (error) {
      console.error(error.message);
    }
  }


  document.addEventListener("click", async (event) => {
    if (event.target && event.target.id === "buy-ticket") {
      const selectedFilmId = document.getElementById("title").dataset.filmId;
      await buyTicket(selectedFilmId);
    }
  });

  hopefully();
})
