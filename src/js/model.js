import { API_URL, RES_PER_PAGE, KEY } from './config.js'
import { AJAX } from './helpers.js'

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: []
}

const createRecipeObject = function (data) {
    const { recipe } = data.data
    state.recipe = {
        cookingTime: recipe.cooking_time,
        id: recipe.id,
        image: recipe.image_url,
        publisher: recipe.publisher,
        servings: recipe.servings,
        title: recipe.title,
        sourceUrl: recipe.source_url,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key }),
    }
}

export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
        createRecipeObject(data)

        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true
        else state.recipe.bookmarked = false;

    } catch (error) {
        throw error
    }
}

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`)
        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                image: rec.image_url,
                publisher: rec.publisher,
                title: rec.title,
                ...(rec.key && { key: rec.key }),
            }

        })
        state.search.page = 1;
    } catch (error) {
        throw error
    }
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page

    const start = (page - 1) * 10
    const end = page * 10

    return state.search.results.slice(start, end)
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {

        // newQuantity / newServings = oldQuantity / oldServings
        ing.quantity = newServings / state.recipe.servings * ing.quantity
    });
    state.recipe.servings = newServings
}
const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
}

export const addBookmark = function (recipe) {
    // Add bookmark
    state.bookmarks.push(recipe)

    //Mark current recipe as bookmarked
    state.recipe.bookmarked = true

    persistBookmarks()
}

export const deleteBookmark = function (id) {
    // Delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id)
    state.bookmarks.splice(index, 1);

    // Mark current recipe as NOT bookmark
    state.recipe.bookmarked = false

    persistBookmarks()

}

const init = function () {
    const storage = JSON.parse(localStorage.getItem('bookmarks'))
    if (storage) state.bookmarks = storage
}
init()

export const uploadRecipe = async function (newRcipe) {
    try {
        const ingredients = Object.entries(newRcipe)
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                // const ingArr = ing[1].replaceAll(' ', '').split(',')
                const ingArr = ing[1].split(',').map(el => el.trim())
                if (ingArr.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format!')
                const [quantity, unit, description] = ingArr
                return { quantity: quantity ? +quantity : null, unit, description }
            })

        const recipe = {
            cooking_time: +newRcipe.cookingTime,
            image_url: newRcipe.image,
            publisher: newRcipe.publisher,
            servings: +newRcipe.servings,
            title: newRcipe.title,
            source_url: newRcipe.sourceUrl,
            ingredients,
        }
        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe)
        createRecipeObject(data)
        addBookmark(state.recipe)
    } catch (error) {
        throw error
    }
}