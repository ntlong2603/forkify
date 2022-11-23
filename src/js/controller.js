import "core-js/stable"
import 'regenerator-runtime/runtime'
import * as model from './model.js'
import { MODEL_CLOSE_SEC } from './config.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js'
import paginationView from './views/paginationView.js'
import bookmarkView from "./views/bookmarkView.js"
import addRecipeView from "./views/addRecipeView.js"

// https://forkify-api.herokuapp.com/v2
///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept()
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1)

    if (!id) return
    recipeView.renderSpinner()

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage())

    // 1) Loading recipe
    await model.loadRecipe(id)

    // 2) Render recipe
    recipeView.render(model.state.recipe)

    // 3) Update bookmarks view
    bookmarkView.update(model.state.bookmarks)

  } catch (error) {
    recipeView.renderError()
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner()

    // 1) Get search query
    const query = searchView.getQuery()
    if (!query) return

    // 2) Load search results
    await model.loadSearchResults(query)

    // 3) Render results
    resultsView.render(model.getSearchResultsPage())

    // 4) Render initial panigation buttons
    paginationView.render(model.state.search)
  } catch (err) {
    console.error(err)
  }
};

const controlPagination = function (gotoPage) {
  //Render NEW results
  resultsView.render(model.getSearchResultsPage(gotoPage))

  //Render NEW panigation buttons
  paginationView.render(model.state.search)
};

const controlServings = function (newServings) {
  // Update recipe servings (in state)
  model.updateServings(newServings);

  //Update the recipe view
  recipeView.update(model.state.recipe)
}

const controlAddBookmarks = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe)

  recipeView.update(model.state.recipe) //update changed view bookmark button when clicked

  // Render recipe bookmarked
  bookmarkView.render(model.state.bookmarks)
}

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRcipe) {
  try {
    addRecipeView.renderSpinner()

    //Upload the new recipe data
    await model.uploadRecipe(newRcipe)

    // Render recipe
    recipeView.render(model.state.recipe);

    // Render success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarkView.render(model.state.bookmarks)

    // Chang ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODEL_CLOSE_SEC * 1000)

  } catch (error) {
    console.error(error)
    addRecipeView.renderError(error.message)
  }
}

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmarks)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log("HELLO WORLD");
}
init()