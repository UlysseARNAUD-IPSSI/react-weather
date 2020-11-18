import './index.css';
import Result from "../Result";
import SearchBar from "../SearchBar";
import React from "react";

class App extends React.Component {

    state = {
        activeSection: "search-bar",
        searchQuery: undefined,
        suggestions: {}
    }

    keymap = {}

    static sections = {
        "search-bar": ".App-section-search_bar",
        "result": ".App-section-result",
    }

    static getSection = name => document.querySelector(App.sections[name])

    static showSection = name => {
        for (let section in App.sections) {
            let method = 'remove'
            if (name === section) method = 'add'

            const element = App.getSection(section)

            element.classList[method]('active')
        }
    }

    static switchToMainSectionWhenEsc = (event) => {
        const {keyCode} = event
        if (27 === keyCode) App.showSection('search-bar')
    }

    constructor(props) {
        super(props)

        this.handleInput = this.handleInput.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleSuggestionClick = this.handleSuggestionClick.bind(this)

        this.updateSuggestions = this.updateSuggestions.bind(this)
        this.updateResult = this.updateResult.bind(this)
        this.updateSearchQuery = this.updateSearchQuery.bind(this)

        this.toggleCityInput = this.toggleCityInput.bind(this)

        this.keymap = {
            ...this.keymap,
            'Enter': this.updateResult,
            '/letter/': this.updateSearchQuery
        }
    }

    componentDidMount() {
        App.initializeCitiesIfNotExists()

        App.showSection(this.state.activeSection)

        document.addEventListener('keydown', App.switchToMainSectionWhenEsc, false)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', App.switchToMainSectionWhenEsc, false)
    }

    render() {
        const {suggestions, searchQuery} = this.state

        let activeCity = localStorage.getItem('active_city_cache')
        if (!!activeCity) activeCity = JSON.parse(activeCity)

        return (
            <div className="App">
                <header className="App-header">
                    Weather
                </header>
                <section className="App-section">
                    <SearchBar
                        handleInput={this.handleInput} handleKeyPress={this.handleKeyPress}
                        handleSuggestionClick={this.handleSuggestionClick}
                        suggestions={suggestions} searchQuery={searchQuery}/>
                    <Result city={activeCity}/>
                </section>
                <footer className="App-footer">
                    Fait par Ulysse ARNAUD avec ReactJS
                </footer>
            </div>
        )
    }

    handleInput(event) {
        event.preventDefault()

        console.log('handleInput', {event})

        App.resetInputCityId()

        const action = this.keymap['/letter/']
        action(event)
    }

    handleKeyPress(event) {
        console.log('handleKeyPress', {event})
        const {key} = event

        if (false === this.keymap.hasOwnProperty(key)) return

        const action = this.keymap[key]
        if (!action) return

        action(event)
    }

    handleSuggestionClick(event) {
        event.preventDefault()
        return this.toggleCityInput(event)
    }

    updateResult(event) {
        console.log('App : updateResult', {event})

        const cityId = App.getInputCityId()
        const city = App.getInputCity()

        console.log({city})

        if (!city) return

        console.log({cityId})

        let activeCity = !!cityId ? App.getCityFromId(cityId) : App.getCityFromName(city)

        console.log({activeCity})

        localStorage.setItem('active_city_cache', JSON.stringify(activeCity))

        this.forceUpdate()

        App.showSection('result')
    }

    updateSearchQuery(event) {
        console.log('App : updateSearchQuery', {event})
        const {target} = event
        const {value: searchQuery} = target

        this.setState({searchQuery})
        this.forceUpdate()

        this.updateSuggestions()
    }

    updateSuggestions() {
        console.log('App : updateSuggestions')

        let suggestions = {}

        let {searchQuery} = this.state

        if (!searchQuery) {
            this.setState({suggestions})
            this.forceUpdate()
            return;
        }

        searchQuery = searchQuery.trim()

        const jQueryVersion = 'jQuery191028882251251129487_1605706515334'
        const endpointFind = `https://openweathermap.org/data/2.5/find?callback=${jQueryVersion}&q=${searchQuery}&type=like&sort=population&cnt=30&appid=439d4b804bc8187953eb36d2a8c26a02&_=1605706515335`
        fetch(endpointFind)
            .then(response => response.text())
            .then(response => {
                response = response.replace(jQueryVersion, '')
                response = response.substring(1, response.length - 1)
                return JSON.parse(response)
            })
            .then(response => {
                console.log({response})
                const {cod, count, list, message} = response
                for (let cursor = 0; cursor < count; cursor++) {
                    const city = list[cursor]
                    App.pushCity(city)

                    const {id, name, sys} = city
                    const {country} = sys

                    if (true === suggestions.hasOwnProperty(id)) {
                        delete suggestions[id]
                    }

                    suggestions[id] = `${name},${country}`
                }
                this.setState({suggestions})
                this.forceUpdate()
            })
            .catch(console.log)
    }

    toggleCityInput(event) {
        const {target} = event
        const {id, name, country} = target.dataset

        const value = `${name}, ${country}`

        App.setInputCity(value)

        App.setInputCityId(id)

        const searchQuery = value
        this.setState({searchQuery})
    }

    static resetInputCityId() {
        const inputCityId = document.querySelector('.App-section-search_bar input[name="city_id"]')
        inputCityId.value = null
    }

    static setInputCityId(id) {
        const inputCityId = document.querySelector('.App-section-search_bar input[name="city_id"]')
        inputCityId.value = id
    }

    static getInputCityId() {
        const inputCityId = document.querySelector('.App-section-search_bar input[name="city_id"]')
        return inputCityId.value
    }

    static resetInputCity() {
        const inputCity = document.querySelector('.App-section-search_bar input[name="city"]')
        inputCity.value = null
    }

    static setInputCity(city) {
        const inputCity = document.querySelector('.App-section-search_bar input[name="city"]')
        inputCity.value = city.trim()
    }

    static getInputCity() {
        const inputCity = document.querySelector('.App-section-search_bar input[name="city"]')
        return inputCity.value
    }

    static getCities() {
        const cities = localStorage.getItem('cities_cache')
        if (!cities) return null
        return JSON.parse(cities)
    }

    static getCityFromName(name) {
        let cities = App.getCities()

        const [_name, _country] = name.split(',')

        console.log({_name, _country})

        for (let cursor = 0, cursorMax = cities.length; cursor < cursorMax; cursor++) {
            const city = cities[cursor]
            if (_name.trim().toLowerCase() === city.name.trim().toLowerCase()) {
                if (!_country) return city
                if (!!_country && _country.trim().toLowerCase() === city.sys.country.trim().toLowerCase()) return city
            }
        }

        return null
    }

    static getCityFromId(id) {
        let cities = App.getCities()

        for (let cursor = 0, cursorMax = cities.length; cursor < cursorMax; cursor++) {
            const city = cities[cursor]
            if (parseInt(id) === parseInt(city.id)) {
                return city
            }
        }

        return null
    }

    static pushCity(city) {
        let cities = App.getCities()

        const {id} = city

        let cityExists = false

        for (let cursor = 0, cursorMax = cities.length; cursor < cursorMax; cursor++) {
            const _city = cities[cursor]
            if (id === _city.id) {
                cityExists = true
                cities[cursor] = city
                break
            }
        }

        if (!cityExists) cities.push(city)

        cities = JSON.stringify(cities)

        localStorage.setItem('cities_cache', cities)
    }

    static initializeCitiesIfNotExists() {
        if (!!localStorage.getItem('cities_cache')) return
        localStorage.setItem('cities_cache', JSON.stringify([]))
    }


}

export default App
