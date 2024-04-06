document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("github-form");
  const searchInput = document.getElementById("search");
  const userList = document.getElementById("user-list");
  const reposList = document.getElementById("repos-list");

  form.addEventListener("submit", handleFormSubmit);

  async function handleFormSubmit(event) {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();

    if (searchTerm === "") {
      alert("Please enter a search term");
      return;
    }

    try {
      const users = await searchUsers(searchTerm);
      displayUsers(users);
    } catch (error) {
      console.error("Error searching users:", error);
      alert("Failed to search users. Please try again later.");
    }
  }

  async function searchUsers(username) {
    const response = await fetch(
      `https://api.github.com/search/users?q=${username}`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();
    return data.items;
  }

  function displayUsers(users) {
    userList.innerHTML = "";
    users.forEach(displayUser);
  }

  function displayUser(user) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <img src="${user.avatar_url}" alt="Avatar" width="50">
      <a href="${user.html_url}" target="_blank">${user.login}</a>
      <button class="view-repos" data-username="${user.login}">View Repos</button>
    `;
    userList.appendChild(listItem);
  }

  async function displayUserRepos(username) {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user repositories: ${response.status}`);
    }

    const repos = await response.json();
    displayRepos(repos);
  }

  function displayRepos(repos) {
    reposList.innerHTML =
      repos.length > 0 ? "" : "<p>No repositories found for this user.</p>";
    repos.forEach((repo) => {
      const listItem = document.createElement("li");
      listItem.textContent = repo.name;
      reposList.appendChild(listItem);
    });
  }

  userList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("view-repos")) {
      const username = event.target.dataset.username;
      try {
        await displayUserRepos(username);
      } catch (error) {
        console.error("Error fetching user repositories:", error);
        alert("Failed to fetch user repositories. Please try again later.");
      }
    }
  });
});
