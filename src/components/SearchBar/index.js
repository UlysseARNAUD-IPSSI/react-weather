import './index.css';

function SearchBar(
    {
        handleKeyPress = (event) => {
        },
        handleInput = (event) => {
        },
        handleSuggestionClick = (event) => {
        },
        suggestions = {},
        searchQuery = undefined
    }) {
    return (
        <section className="App-section-search_bar active">
            <div className="container">
                <input
                    type="text" name="city" id="city" placeholder="Enter a city"
                    onInput={handleInput} onKeyPress={handleKeyPress}/>
                <input type="hidden" name="city_id" id="city_id"/>
                <aside className="App-section-search_bar-suggestions">
                    {0 !== Object.keys(suggestions).length ? (
                            <>
                                <h2>Did you mean ?</h2>
                                <div className="App-section-search_bar-suggestions-list">
                                    {
                                        Object.keys(suggestions).map(id => {
                                            let city = suggestions[id]
                                            const [name, country] = city.split(',')
                                            return (
                                                <article
                                                    key={id}
                                                    className="Suggestion"
                                                    onClick={handleSuggestionClick}
                                                    data-name={name} data-country={country} data-id={id}>
                                                    {name}<br/>{country}
                                                </article>
                                            )
                                        })
                                    }
                                </div>
                            </>
                        )
                        : (
                            !!searchQuery ? (
                                <h2>No cities found for "{searchQuery}"</h2>
                            ) : null
                        )
                    }
                </aside>
            </div>
        </section>
    )
}

export default SearchBar
